import {
  AdminInterview,
  AdminCompanyInterview,
  AdminSubjectInterview,
  AdminSvarInterview,
  AdminVerbalInterview,
  AdminWrittenInterview,
  Interview,
  InterviewQuestionsByAdmin
} from "../models/interview.models.js";
import { Student, User } from "../models/users.models.js";
import sendMail from "../utils/sendMail.js";
import InterviewInvitationTemplate from "../utils/emailTemplates/interviewInvitation.js";
import { Parser } from "json2csv";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAllAdminInterviews } from "../utils/crud.js";
import {attendancePipeline} from "../pipelines/attendance.pipeline.js";
const link = process.env.INTERVIEW_BASE_URL || `https://glamis.in/myInterview/`;


// ---------------------- Create Company Interview ----------------------

export const createCompanyInterview = async (req, res) => {
  try {
    const {
      name,
      company,
      date,
      from,
      to,
      job_description,
      no_of_questions,
      easy_remaining,
      medium_remaining,
      hard_remaining,
      questions,
      position,
      students,
      type
    } = req.body;
    // if not login then first login then redisect to this page
    // const link = `https://glamis.in/myInterviews/`;
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
            title: `${name} | ${company} | ${position}`,
            totalQuestions: no_of_questions,
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
      const newQuestion = new InterviewQuestionsByAdmin({
        question: questions[i].question,
        difficulty: questions[i].difficulty
      });
      await newQuestion.save();
      questionIds.push(newQuestion._id);
    }


    console.log(name, company, date, from, to, job_description, no_of_questions, easy_remaining, medium_remaining, hard_remaining, questionIds, position, link);
    const newCompanyInterview = new AdminCompanyInterview({
      name,
      company,
      date,
      from,
      to,
      job_description,
      no_of_questions,
      easy_remaining,
      medium_remaining,
      hard_remaining,
      questions: questionIds,
      position,
      link,
      students: studentIds,
      interview: interviewIds
    });


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

    // const link = `https://glamis.in/myInterviews/`;
    ;
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
            totalQuestions: no_of_questions,
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
      const newQuestion = new InterviewQuestionsByAdmin({
        question: questions[i].question,
        difficulty: questions[i].difficulty
      });
      await newQuestion.save();
      questionIds.push(newQuestion._id);
    }

    const newSubjectInterview = new AdminSubjectInterview({
      name,
      subject,
      date,
      from,
      to,
      no_of_questions,
      easy,
      medium,
      hard,
      questions: questionIds,
      students: studentIds,
      interview: interviewIds,
      link
    });
    await newSubjectInterview.save();

    res.status(200).json({ message: "Subject Interview Created Successfully", link: newSubjectInterview.link });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createVerbalInterview = async (req, res) => {
  try {
    const { name, date, from, to, no_of_questions, type, easy, medium, hard, questions, students } = req.body;

    // const link = `https://glamis.in/myInterviews/`;
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
            totalQuestions: no_of_questions,
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
      const newQuestion = new InterviewQuestionsByAdmin({
        question: questions[i].question,
        difficulty: questions[i].difficulty
      });
      await newQuestion.save();
      questionIds.push(newQuestion._id);
      console.log(newQuestion);
    }

    console.log(name, date, from, to, no_of_questions, easy, medium, hard, questionIds, students, interviewIds, link);

    const newVerbalInterview = new AdminVerbalInterview({
      name,
      date,
      from,
      to,
      no_of_questions,
      easy,
      medium,
      hard,
      questions: questionIds,
      students: studentIds,
      interview: interviewIds,
      link
    });

    await newVerbalInterview.save();

    res.status(200).json({ message: "Verbal Interview Created Successfully", link: newVerbalInterview.link });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createWrittenInterview = async (req, res) => {

  try {
    const {
      name, domain, date, from, to, no_of_questions, fillInTheBlanks,
      synonymsAndAntonyms, type, essay, jumbled, errorDetection, questions, students
    } = req.body;
    // const link = `https://glamis.in/myInterviews/`;

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
            totalQuestions: no_of_questions,
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
      const newQuestion = new InterviewQuestionsByAdmin({
        question: questions[i].question,
        difficulty: questions[i].questionType
      });
      await newQuestion.save();
      questionIds.push(newQuestion._id);
    }

    const newWrittenInterview = new AdminWrittenInterview({
      name,
      domain,
      date,
      from,
      to,
      no_of_questions,
      essay,
      jumbled,
      fillInTheBlanks,
      synonymsAndAntonyms,
      errorDetection,
      questions: questionIds,
      students: studentIds,
      interview: interviewIds,
      link
    });

    await newWrittenInterview.save();

    res.status(200).json({ message: "Written Interview Created Successfully", link: newWrittenInterview.link });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createSvarInterview = async (req, res) => {

  try {
    const {
      name,
      date,
      from,
      to,
      no_of_questions,
      reading,
      repeating,
      short,
      jumbled,
      questions,
      comprehension,
      students,
      type
    } = req.body;
    // const link = `https://glamis.in/myInterviews/`;

    const studentEmails = students;

    const studentIds = [];
    const interviewIds = [];
    for (let i = 0; i < studentEmails.length; i++) {
      const user = await User.findOne({ email_id: studentEmails[i] });
      if (user) {
        const student = await Student.findOne({ user: user._id });
        if (student) {
          studentIds.push(student._id);
          const interview = new Interview({
            description: "Svar Interview",
            start_time: date + 'T' + from,
            end_time: date + 'T' + to,
            title: `${name}`,
            type: "Svar"
          });
          await interview.save();

          student.interview_taken.push(interview._id);
          await student.save();

          interviewIds.push(interview._id);
          try {
            await sendMail(studentEmails[i], "Interview Invitation", InterviewInvitationTemplate(name, "Svar", link, date + ' at ' + from));
          } catch (error) {
            console.log(error);
          }
        }
      }

    }

    // console.log(students);
    console.log("came till here")
    const questionIds = [];
    for (let i = 0; i < questions.length; i++) {
      const newQuestion = new InterviewQuestionsByAdmin({
        question: questions[i].question,
        difficulty: questions[i].questionType
      });
      await newQuestion.save();
      questionIds.push(newQuestion._id);
    }
    console.log("came till here")
    const newWrittenInterview = new AdminSvarInterview({
      name,
      domain: "Svar Interview",
      date,
      from,
      to,
      no_of_questions,
      reading,
      repeating,
      short,
      jumbled,
      comprehension,
      questions: questionIds,
      students: studentIds,
      interview: interviewIds,
      link,
      type: "Svar"
    });

    await newWrittenInterview.save();

    res.status(200).json({ message: "Written Interview Created Successfully", link: newWrittenInterview.link });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export const fetchAdminInterviewbyinterviewId = async (req, res) => {
  try {
    const { interviewId } = req.body;

    // Ensure interviewId is treated as array for $in operator
    const interviewIdArray = Array.isArray(interviewId) ? interviewId : [interviewId];
    const admin = await AdminInterview.findOne({ interview: { $in: interviewIdArray } });

    if (!admin) {
      return res.status(404).json({ message: "Interview not found" });
    }

    console.log(admin);

    res.status(200).json({
      company: admin.company || admin.subject || admin.domain || "",
      adminInterviewId: admin._id,
      totalQuestions: admin.no_of_questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export const fetchInterviewStatusCount = async (req, res) => {
  try {
    const allInterviews = await AdminInterview.find({});
    const totalInterviews = allInterviews.length;

    let endedInterview = 0;
    const currentTime = new Date();

    for (let i = 0; i < allInterviews.length; i++) {
      const interview = allInterviews[i];
      if (interview.date && interview.to) {
        const endTime = new Date((interview.date + 'T' + interview.to).replace(/T\d{2}:\d{2}/, ''));
        if (currentTime > endTime) {
          endedInterview++;
        }
      }
    }

    let pendingInterviews = totalInterviews - endedInterview;

    res.status(200).json({ totalInterviews, endedInterview, pendingInterviews });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const fetchInterviewDetails = async (req, res) => {
  try {
    // take all 4 interview types and sort it by latest date and time
    const { page, limit } = req.body;
    const allInterviews = await getAllAdminInterviews({});

    allInterviews.sort((a, b) => {
      const dateA = new Date((a.date + 'T' + a.from).replace(/T\d{2}:\d{2}/, ''));
      const dateB = new Date((b.date + 'T' + b.from).replace(/T\d{2}:\d{2}/, ''));
      return dateB - dateA;
    });

    // take only latest 10 interviews
    let latestInterviews = allInterviews.slice(0, 10);
    if (page && limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      latestInterviews = allInterviews.slice(startIndex, endIndex);
    }


    const interviews = [];
    for (let i = 0; i < latestInterviews.length; i++) {
      const interview = latestInterviews[i];

      interviews.push({
        company: interview.company || interview.subject || interview.domain,
        _id: interview._id,
        name: interview.name,
        date: interview.date,
        slot: `${interview.from} to ${interview.to}`,
        candidates: interview.students.length,
        status: new Date((interview.date + 'T' + interview.to).replace(/T\d{2}:\d{2}/, '')) > new Date() ? "Pending" : "Ended"
      });
    }

    // console.log(interviews);

    res.status(200).json({ interviews });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// deprecated by krish
export const fetchInterviewByID = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json(ApiError(404, "Interview ID not sent"))
    }

    const interview = await AdminInterview.findOne({
      interview: interviewId
    })

    if (!interview) {
      return res.status(400).json(ApiError(400, "Interview not found!"));
    }

    return res.status(200).json(new ApiResponse(200, interview, "Interview Fetched Successfully"));
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error" || err.message
    })
  }
}
// ---------------------- CRUD Operations ----------------------

export async function getInterviewByID(interviewId) {
  return await AdminInterview.findById(interviewId);
}

// ---------------------- Download Attendance ----------------------

export const downloadAttendance = async (req, res) => {
  try {
    const interviewId = req.query.interviewId;
    if (!interviewId) return res.status(404).json({ message: "id is required" });

    let interviews = []
    if (typeof interviewId === "string") {
      const interview = await getInterviewByID(interviewId);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      interviews = interview.interview;  // array of interview ids of students who have interview scheduled
    } else if (Array.isArray(interviewId)) {
      for (let i = 0; i < interviewId.length; i++) {
        const interview = await getInterviewByID(interviewId[i]);
        if (interview) {
          interviews.push(...interview.interview);
        }
      }
    }

    const students = await Interview.aggregate(attendancePipeline(interviews));
    const fields = ['Email', 'Name', 'UserId', 'Present', "AttemptedQuestions", 'TechnicalScore','AverageScore','GrammarScore', "TabSwitches", 'View_Report'];
    const opts = { fields };
    const parser = new Parser(opts);
    let arr = [];
    if (students.length > 0) {
      arr = students[0].emails;
    }
    arr.forEach((item) => { console.log(item) });
    const csv = parser.parse(arr);
    res.setHeader('Content-Type', 'text/csv');
    const filename = typeof interviewId === "string" ? `interview_${interviewId}.csv` : `interviews_${interviewId.join('-')}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }

}
