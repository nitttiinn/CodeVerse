import { SubmitBatch } from "../libs/judge0.lib.js";

export const executeCode = async(req, res) =>{
    const userId = req.user.id;

    if(!userId){
        return res.status(404).json({
            success: false,
            error: 'User not found - login or signup required.'
        });
    };

    const {source_code, language_id, stdin, expected_ouputs, problemId} = req.body;
        
    if(!source_code || !language_id || !stdin || !expected_ouputs || !problemId){
        return res.status(400).json({
            success: false,
            error: 'Bad Request - All fields are required.'
        });
    };

    // 1. validate test cases
    if(!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_ouputs) || expected_ouputs.length !== stdin.length){
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
            stdin: input,
            base64_encoded: false,
            wait: false
        }));

        // 3. submit the batch to judge0
        const submitResponse  = await SubmitBatch(submissions);

        
    } catch (error) {
        console.log("Error During Executing Code: ", error);
        
    }
}