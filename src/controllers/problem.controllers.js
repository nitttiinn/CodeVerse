import {db} from '../libs/db.js';
import { getJudge0LanguageId, pollBatchResults, SubmitBatch } from '../libs/judge0.lib.js';

export const createProblem = async (req, res) =>{
    // Extract All required data from the request body
    const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions} = req.body;
    // again check if the user is admin or not
    if(req.user.role !== 'ADMIN'){
        // if not then return an error response
        return res.status(403).json({
            success: false,
            error: 'Forbidden - You do not have permission to create a problem.'
        });
    };
    // validate the required fields
    if(!title || !description || !difficulty || !tags || !examples || !constraints || !testcases || !codeSnippets || !referenceSolutions){
        // if any of the required fields are missing then return an error response
        return res.status(400).json({
            success: false,
            error: 'Bad Request - All fields are required to create a problem.'
        });
    };

    // Check if the problem already exists
    const existingProblem = await db.problem.findUnique({
        where: {title: title.trim()}
    });
    if(existingProblem){
        return res.status(409).json({
            success: false,
            error: 'Conflict - A problem with this title already exists.'
        });
    };
    // create the problem in the database
    try {
        for(const [language, solutions] of Object.entries(referenceSolutions)){
            //Get the language ID for the reference solution, from the Judge0 API
            const languageId = getJudge0LanguageId(language);

            if(!languageId){
                return res.status(400).json({
                    success: false,
                    // message : `Bad Request - Invalid language: ${language}.`
                    error : `Bad Request - Invalid language: ${language}.`
                });
            };

            // Prepare the submission for the Judge0 API (Array of objects for each test case)
            const submissions = testcases.map(({input, output}) =>({
                language_id: languageId,
                source_code: solutions,
                stdin: input,
                expected_output: output
            }));

            // create a batch submission
            const submissionResult = await SubmitBatch(submissions);

            if(!submissionResult){
                return res.status(500).json({
                    success: false,
                    error: 'Internal Server Error - Unable to create problem.'
                });
            };

            const submissionsToken = submissionResult.map((res) => res.token);

            // Polling
            const results = await pollBatchResults(submissionsToken);

            for(let i = 0; i<results.length; i++){
                const result = results[i];
                console.log("Result: ", result);
                if(result.status.id !== 3){
                    return res.status(400).json({
                        success: false,
                        error: `Submission failed - Test Case ${i+1} failed.`
                    });
                };
            };


            // Save the problem to the database.
            const newProblem = await db.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    tags,
                    examples,
                    constraints,
                    codeSnippets,
                    referenceSolutions,
                    testcases,
                    userId: req.user.id
                }
            });

            return res.status(201).json({
                success:true,
                message: 'Problem created successfully.',
                problem: newProblem
            })
        }
        
    } catch (error) {
        console.error('Error creating problem:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error - Unable to create problem.'
        });
        
    }
    // if yes then create a problem in the database
    // loop through each reference solutions  for different languages
        // get the language id for the reference solution or current language
        // Prepare Judge0 submission for all the test cases.
        // (Enhancement) - Convert Submission to chunks of 20
        // submit all the test cases in one Batch
};

export const getAllProblems = async (req, res) =>{
    try{
        const problems = await db.problem.findMany(); // never return null, if no problems founds then returns a empty array

        if(problems.length === 0){
            return res.status(404).json({
                success: false,
                error: "No problem found"
            });
        };

        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        })

    } catch(error){
        console.log("Error: ", error);
        return res.status(500).json({
            success: false, 
            error: "Error While Fetching Problems"
        })
    }
}

export const getProblemById = async (req, res) =>{
    const {id} = req.params;

    console.log("ID: ", id);

    if(!id || typeof id !== "string"){
        return res.status(400).json({
            success: false,
            error: "Bad Request - Invalid problem id"
        });
    }

    try {
        const problem = await db.problem.findUnique({
            where:{id}
        });

        if(!problem){
            return res.status(404).json({
                success: false,
                error: "Problem not found"
            });
        };

        res.status(200).json({
            success: true,
            message: "Problem Found Successfully",
            problem
        })
    } catch (error) {
        console.log("Error during fetching problem: ", error);
        res.status(500).json({
            success: false,
            error: "Error While Fetching Problem"
        });
    };
};

// Assignment 
export const updateProblem = async (req, res) =>{
    
};

export const deleteProblem = async (req, res) =>{

};

export const getAllProblemsSolvedByUser = async (req, res) =>{};