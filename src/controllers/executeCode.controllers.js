import { pollBatchResults, SubmitBatch } from "../libs/judge0.lib.js";

export const executeCode = async(req, res) =>{
    const userId = req.user.id;
    if(!userId){
        return res.status(404).json({
            success: false,
            error: 'User not found - login or signup required.'
        });
    };

    const {source_code, language_id, stdin, expected_outputs, problemId} = req.body;
    if(!source_code || !language_id || !stdin || !expected_outputs || !problemId){
        return res.status(400).json({
            success: false,
            error: 'Bad Request - All fields are required.'
        });
    };

    // 1. validate test cases
    if(!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length){
        return res.status(400).json({
            success: false,
            error: 'Bad Request - Invalid or missing test cases!'
        });
    };

    try {
        // 2. Prepare each test cases for judge0 batch submission
        const submissions = stdin.map((input) =>({
            source_code,
            language_id,
            stdin: input
        }));

        // 3. submit the batch to judge0
        const submitResponse  = await SubmitBatch(submissions);
        const tokens = submitResponse.map((res) => res.token);

        // 4. Poll Judge0 for reusults of all submitted test cases
        const result = await pollBatchResults(tokens);
        console.log("Result-----------");
        console.log(result);

        res.status(200).json({
            success: true,
            message: "Code Executed Successfully!"
        });
        
    } catch (error) {
        console.log("Error During Executing Code: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error - Unable to execute code."
        });
    };
}