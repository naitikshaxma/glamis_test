import { InterviewResult } from "../models/interview.models.js"

const getResult = async (req, res) => {
    try {
        const interviewResult = await InterviewResult.findById(req.body.resultId);
        res.json(interviewResult);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

export default getResult ;