import { Interview, InterviewQuestion } from "../models/interview.models.js";
import { Student, User } from "../models/users.models.js";

const getResultsByInterviewId = async (req, res) => {
    try {
        const interviewResults = await InterviewQuestion.find({ interview: req.body.interviewId });
        const interview = await Interview.findById(req.body.interviewId);

        // Check if results exist
        if (interviewResults.length === 0) {
            return res.status(404).json({ message: "No results found for this interview" });
        }

        // Step 2: Extract the student ID from the first question
        const studentId = interviewResults[0]?.student;

        // Step 3: Fetch student details
        const student = await User.findById(studentId);

        if (student) {
            console.log(student);
        }

        console.log("This is the output from interviewResults controller", interviewResults);
        res.json({
            interviewResults: interviewResults,
            interviewType: interview.type,
            studentName: student?.name,
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
};


export default getResultsByInterviewId;