import { AdminCompanyInterview } from "../models/interview.models.js";
import { Student, User } from "../models/users.models.js";
import { InterviewQuestionsByAdmin } from "../models/interview.models.js";
import { Interview } from "../models/interview.models.js";
import sendMail from "../utils/sendMail.js";
import InterviewInvitationTemplate from "../utils/emailTemplates/interviewInvitation.js";


export const createCompanyInterview = async (req, res) => {
    try {
        const { name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questions, position, students } = req.body;

        const link = `https://glamis.in/interview/${company}/${position}`;
        const studentEmails = students;
        const studentIds = [];
        const interviewIds = [];
        for (let i = 0; i < studentEmails.length; i++) {
            const user = await User.findOne({ email_id: studentEmails[i] });
            if (user) {
                const student = await Student.findOne({ user: user._id });
                if (student) {
                    try {
                        await sendMail(studentEmails[i], "Interview Invitation", InterviewInvitationTemplate(name, company, link, date + ' at ' + from));
                    } catch (error) {
                        console.log(error);
                    }
                    studentIds.push(student._id);
                    const interview = new Interview({
                        description: job_description,
                        start_time: date + 'T' + from,
                        end_time: date + 'T' + to,
                        title: position,
                    });
                    await interview.save();

                    student.interview_taken.push(interview._id);
                    student.save();

                    interviewIds.push(interview._id);
                }
            }

        }

        console.log(students);
        const questionIds = [];
        for (let i = 0; i < questions.length; i++) {
            const newQuestion = new InterviewQuestionsByAdmin({ question: questions[i].question, difficulty: questions[i].difficulty });
            await newQuestion.save();
            questionIds.push(newQuestion._id);
        }




        console.log(name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questionIds, position, link);
        const newCompanyInterview = new AdminCompanyInterview({ name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questions: questionIds, position, link, students: studentIds, interview: interviewIds });


        // const newCompanyInterview = new AdminCompanyInterview({name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questions : questionIds, position, link });
        await newCompanyInterview.save();
        console.log('wow');
        res.status(200).json({ message: "Company Interview Created Successfully", link: newCompanyInterview.link });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const fetchAdminInterviewbyinterviewId = async (req, res) => {
    try {
        const { interviewId } = req.body;
        // interview = [ " ", "" ] it is an array of interview ids
        const admin = await AdminCompanyInterview.find({ interview: { $in: interviewId } });

        res.status(200).json({ company : admin.company , adminInterviewId: admin._id});
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}