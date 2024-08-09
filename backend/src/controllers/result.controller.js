import { InterviewQuestion } from "../models/interview.models.js";

const getResultsByInterviewId = async (req, res) => {
    try {
        const interviewResults = await InterviewQuestion.find({ interview: req.body.interviewId });
        console.log("This is the output from interviewResults controller" , interviewResults);
        res.json(interviewResults);
    } catch (error) {
        res.status(500).send('Server error');
    }
};


export default getResultsByInterviewId;