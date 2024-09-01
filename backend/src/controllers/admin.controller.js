import { AdminCompanyInterview, AdminSubjectInterview, AdminVerbalInterview, AdminWrittenInterview } from "../models/interview.models.js";
import { Student, User } from "../models/users.models.js";
import { InterviewQuestionsByAdmin } from "../models/interview.models.js";
import { Interview } from "../models/interview.models.js";
import sendMail from "../utils/sendMail.js";
import InterviewInvitationTemplate from "../utils/emailTemplates/interviewInvitation.js";


export const createCompanyInterview = async (req, res) => {
    try {
        const { name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questions, position, students, type } = req.body;

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
                        type
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
        const firstQuestion = new InterviewQuestionsByAdmin({ question: "Tell me about yourself", difficulty: "Easy" });
        await firstQuestion.save();
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

export const createSubjectInterview = async (req, res) => {
    try {
        const { name, subject, date, from, to, no_of_questions, type, easy, medium, hard, questions, students } = req.body;
        
        const link = `https://glamis.in/interview/${subject}`;
        const studentEmails = students;
        const studentIds = [];
        const interviewIds = [];
        for (let i = 0; i < studentEmails.length; i++) {
            const user = await User.findOne({ email_id: studentEmails[i] });
            if (user) {
                const student = await Student.findOne({ user: user._id });
                if (student) {
                    try {
                        await sendMail(studentEmails[i], "Interview Invitation", InterviewInvitationTemplate(name, subject, link, date + ' at ' + from));
                    } catch (error) {
                        console.log(error);
                    }
                    studentIds.push(student._id);
                    const interview = new Interview({
                        description: subject,
                        start_time: date + 'T' + from,
                        end_time: date + 'T' + to,
                        title: `${name} | ${subject}`,
                        type
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

        const newSubjectInterview = new AdminSubjectInterview({ name, subject, date, from, to, no_of_questions, easy, medium, hard, questions: questionIds, students: studentIds, interview: interviewIds, link });
        await newSubjectInterview.save();

        res.status(200).json({ message: "Subject Interview Created Successfully", link: newSubjectInterview.link });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const fetchAdminInterviewbyinterviewId = async (req, res) => {
    try {
        const { interviewId } = req.body;

        let admin = await AdminCompanyInterview.findOne({ interview: { $in: interviewId } });

        if (!admin) {
            admin = await AdminSubjectInterview.findOne({ interview: { $in: interviewId } });
        }
        if (!admin) {
            admin = await AdminWrittenInterview.findOne({ interview: { $in: interviewId } });
        }

        if (!admin) {
            admin = await AdminVerbalInterview.findOne({ interview: { $in: interviewId } });
        }

        console.log(admin);

        res.status(200).json({ company: admin.company || admin.subject || admin.domain || "", adminInterviewId: admin._id, totalQuestions: admin.no_of_questions });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const createVerbalInterview = async (req, res) => {
    try{
        const { name, date, from, to, no_of_questions, type, easy, medium, hard, questions, students } = req.body;

        const link = `https://glamis.in/interview/${name}`;
        const studentEmails = students;

        const studentIds = [];
        const interviewIds = [];
        for (let i = 0; i < studentEmails.length; i++) {
            const user = await User.findOne({ email_id: studentEmails[i] });
            if (user) {
                const student = await
                    Student.findOne({ user: user._id });
                if (student) {
                    try {
                        await sendMail(studentEmails[i], "Interview Invitation", InterviewInvitationTemplate(name, name, link, date + ' at ' + from));
                    } catch (error) {
                        console.log(error);
                    }
                    studentIds.push(student._id);
                    const interview = new Interview({
                        description: name,
                        start_time: date + 'T' + from,
                        end_time: date + 'T' + to,
                        title: `${name} | Communication round`,
                        type
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
            console.log(newQuestion);
        }

        console.log(name, date, from, to, no_of_questions, easy, medium, hard, questionIds, students, interviewIds, link);

        const newVerbalInterview = new AdminVerbalInterview({ name, date, from, to, no_of_questions, easy, medium, hard, questions: questionIds, students: studentIds, interview: interviewIds, link });

        await newVerbalInterview.save();

        res.status(200).json({ message: "Verbal Interview Created Successfully", link: newVerbalInterview.link });
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}

export const createWrittenInterview = async (req, res) => {

    try{
        const { name, domain, date, from, to, no_of_questions ,fillInTheBlanks,
            synonymsAndAntonyms, type, essay, jumbled, errorDetection, questions, students } = req.body;
        const link = `https://glamis.in/interview/${domain}`;

        const studentEmails = students;

        const studentIds = [];
        const interviewIds = [];
        for (let i = 0; i < studentEmails.length; i++) {
            const user = await User.findOne({ email_id: studentEmails[i] });
            if (user) {
                const student = await Student.findOne({ user: user._id });
                if (student) {
                    try {
                        await sendMail(studentEmails[i], "Interview Invitation", InterviewInvitationTemplate(name, domain, link, date + ' at ' + from));
                    } catch (error) {
                        console.log(error);
                    }
                    studentIds.push(student._id);
                    const interview = new Interview({
                        description: domain,
                        start_time: date + 'T' + from,
                        end_time: date + 'T' + to,
                        title: `${name}`,
                        type
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
            const newQuestion = new InterviewQuestionsByAdmin({ question: questions[i].question, difficulty: questions[i].questionType });
            await newQuestion.save();
            questionIds.push(newQuestion._id);
        }

        const newWrittenInterview = new AdminWrittenInterview({ name, domain, date, from, to, no_of_questions, essay, jumbled,fillInTheBlanks, synonymsAndAntonyms ,errorDetection, questions: questionIds, students: studentIds, interview: interviewIds, link });

        await newWrittenInterview.save();

        res.status(200).json({ message: "Written Interview Created Successfully", link: newWrittenInterview.link });

    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}