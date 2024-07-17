import { InterviewResult } from "../models/interview.models.js";

const getResultsByInterviewId = async (req, res) => {
    try {
        const interviewResults = await InterviewResult.find({ interview: req.body.interviewId });
        res.json(interviewResults);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

export default getResultsByInterviewId;
