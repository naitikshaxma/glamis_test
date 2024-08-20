import { AdminCompanyInterview } from "../models/interview.models.js";
import { Student } from "../models/users.models.js";
import { InterviewQuestionsByAdmin } from "../models/interview.models.js";


export const createCompanyInterview = async (req, res) => {
    try {
        const { name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questions, position } = req.body;

        // const studentEmails = students;
        // const studentIds = [];
        // for (let i = 0; i < studentEmails.length; i++) {
        //     const student = await Student.findOne({ email_id: studentEmails[i] });
        //     if (student) {
        //         studentIds.push(student._id);
        //     }

        // }
        const questionIds = [];
        for (let i = 0; i < questions.length; i++) {
            const newQuestion = new InterviewQuestionsByAdmin({ question: questions[i].question, difficulty: questions[i].difficulty });
            await newQuestion.save();
            questionIds.push(newQuestion._id);
        }

        const link = `https://glamis.in/interview/${company}/${position}`;


        console.log(name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questionIds, position, link);
        const newCompanyInterview = new AdminCompanyInterview({ name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questions: questionIds, position, link });















        // const newCompanyInterview = new AdminCompanyInterview({name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questions : questionIds, position, link });
        await newCompanyInterview.save();
        console.log('wow');
        res.status(200).json({ message: "Company Interview Created Successfully", link: newCompanyInterview.link });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}