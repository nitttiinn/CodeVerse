import {db} from '../libs/db.js';

export const createProblem = async (req, res) =>{
    // Extract All required data from the request body
    const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions} = req.body;
    // again check if the user is admin or not
    if(req.user.role !== 'ADMIN'){
        // if not then return an error response
        return res.status(403).json({
            success: false,
            message: 'Forbidden - You do not have permission to create a problem.'
        });
    };
    // validate the required fields
    if(!title || !description || !difficulty || !tags || !examples || !constraints || !testcases || !codeSnippets || !referenceSolutions){
        // if any of the required fields are missing then return an error response
        return res.status(400).json({
            success: false,
            message: 'Bad Request - All fields are required to create a problem.'
        });
    };

    // Check if the problem already exists
    const existingProblem = await db.problem.findUnique({
        where: {title: title.trim()}
    });
    if(existingProblem){
        return res.status(409).json({
            success: false,
            message: 'Conflict - A problem with this title already exists.'
        });
    };
    // create the problem in the database
    try {
        for(const [language, solutions] of Object.entries(referenceSolutions)){
            //Get the language ID for the reference solution, from the Judge0 API
            
        }
        
    } catch (error) {
        console.error('Error creating problem:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error - Unable to create problem.'
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

};

export const getProblemById = async (req, res) =>{

};

export const updateProblem = async (req, res) =>{

};

export const deleteProblem = async (req, res) =>{

};

export const getAllProblemsSolvedByUser = async (req, res) =>{};