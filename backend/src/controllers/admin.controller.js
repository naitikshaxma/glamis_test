import { AdminCompanyInterview } from "../models/interview.models";
import { Student } from "../models/users.models";
import { InterviewQuestionByAdmin } from "../models/interview.models";


export const createCompanyInterview = async (req, res) => {
    try {
        const {name, company, from, to, job_description, students, interview, no_of_questions, easy_remaning, medium_remaning, hard_remaning, questions, position } = req.body;
        const studentEmails = students;
        const studentIds = [];
        for (let i = 0; i < studentEmails.length; i++) {
            const student = await Student.findOne({ email_id: studentEmails[i] });
            if (student) {
                studentIds.push(student._id);
            }
            
        }
        const questionIds = [];
        for (let i = 0; i < questions.length; i++) {
            const newQuestion = new InterviewQuestionByAdmin({question : questions[i].question, difficulty : questions[i].difficulty});
            await newQuestion.save();
            questionIds.push(newQuestion._id);
        }

        const link = `https://glamis.in/interview/${company}/${position}`;

        const newCompanyInterview = new AdminCompanyInterview({name,  company, from, to, job_description, students : studentIds, interview, no_of_questions, easy_remaning, medium_remaning, hard_remaning, questions : questionIds, position, link });
        await newCompanyInterview.save();
        res.status(200).json({ message: "Company Interview Created Successfully" , link : newCompanyInterview.link});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}