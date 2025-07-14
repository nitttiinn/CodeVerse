import axios from "axios";

export const getJudge0LanguageId = (Language) => {
    const languageMap = {
        'JAVASCRIPT': 63,
        'PYTHON': 71,
        'JAVA': 62
    }

    return languageMap[Language.toUpperCase()];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async(tokens) =>{
    while(true){
        const {data} = await axios.get(`${process.env.JUDGE_API_URL}/submissions/batch`,{
            params:{
                tokens: tokens.join(','),
                base64_encoded: false
            }
        });

        const results = data.submisions;

        const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !== 2);

        if(isAllDone){
            return results;
        };

        await sleep(1000);
    };
};

export const SubmitBatch = async (submisions) => {
    const { data } = await axios.post(`${process.env.JUDGE_API_URL}/submissions/batch?base64_encoded=false`,{submisions});

    console.log("Submission result: ", data);
    return data; //  [{token}, {token}, {token}];
};