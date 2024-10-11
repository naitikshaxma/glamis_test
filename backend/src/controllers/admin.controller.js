import {
  AdminCompanyInterview,
  AdminSubjectInterview,
  AdminSvarInterview,
  AdminVerbalInterview,
  AdminWrittenInterview,
  Interview,
  InterviewQuestionsByAdmin
} from "../models/interview.models.js";
import {Student, User} from "../models/users.models.js";
import sendMail from "../utils/sendMail.js";
import InterviewInvitationTemplate from "../utils/emailTemplates/interviewInvitation.js";
import {Parser} from "json2csv";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const link = `https://glamis.in/myInterview/`;


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
      const user = await User.findOne({email_id: studentEmails[i]});
      if (user) {
        const student = await Student.findOne({user: user._id});
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
    const firstQuestion = new InterviewQuestionsByAdmin({question: "Tell me about yourself", difficulty: "Easy"});
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
    res.status(200).json({message: "Company Interview Created Successfully", link: newCompanyInterview.link});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

export const createSubjectInterview = async (req, res) => {
  try {
    const {name, subject, date, from, to, no_of_questions, type, easy, medium, hard, questions, students} = req.body;

    // const link = `https://glamis.in/myInterviews/`;
    ;
    const studentEmails = students;
    const studentIds = [];
    const interviewIds = [];
    for (let i = 0; i < studentEmails.length; i++) {
      const user = await User.findOne({email_id: studentEmails[i]});
      if (user) {
        const student = await Student.findOne({user: user._id});
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

    res.status(200).json({message: "Subject Interview Created Successfully", link: newSubjectInterview.link});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

export const createVerbalInterview = async (req, res) => {
  try {
    const {name, date, from, to, no_of_questions, type, easy, medium, hard, questions, students} = req.body;

    // const link = `https://glamis.in/myInterviews/`;
    const studentEmails = students;

    const studentIds = [];
    const interviewIds = [];
    for (let i = 0; i < studentEmails.length; i++) {
      const user = await User.findOne({email_id: studentEmails[i]});
      if (user) {
        const student = await
          Student.findOne({user: user._id});
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

    res.status(200).json({message: "Verbal Interview Created Successfully", link: newVerbalInterview.link});
  } catch (error) {
    res.status(500).json({message: error.message});
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
      const user = await User.findOne({email_id: studentEmails[i]});
      if (user) {
        const student = await Student.findOne({user: user._id});
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

    res.status(200).json({message: "Written Interview Created Successfully", link: newWrittenInterview.link});

  } catch (error) {
    res.status(500).json({message: error.message});
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
      const user = await User.findOne({email_id: studentEmails[i]});
      if (user) {
        const student = await Student.findOne({user: user._id});
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
          student.save();
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

    const questionIds = [];
    for (let i = 0; i < questions.length; i++) {
      const newQuestion = new InterviewQuestionsByAdmin({
        question: questions[i].question,
        difficulty: questions[i].questionType
      });
      await newQuestion.save();
      questionIds.push(newQuestion._id);
    }

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

    res.status(200).json({message: "Written Interview Created Successfully", link: newWrittenInterview.link});

  } catch (error) {
    res.status(500).json({message: error.message});
  }
}


// ---------------------- Fetch Interview by Interview ID ----------------------


export const fetchAdminInterviewbyinterviewId = async (req, res) => {
  try {
    const {interviewId} = req.body;

    let admin = await AdminCompanyInterview.findOne({interview: {$in: interviewId}});

    if (!admin) {
      admin = await AdminSubjectInterview.findOne({interview: {$in: interviewId}});
    }
    if (!admin) {
      admin = await AdminWrittenInterview.findOne({interview: {$in: interviewId}});
    }

    if (!admin) {
      admin = await AdminVerbalInterview.findOne({interview: {$in: interviewId}});
    }

    console.log(admin);

    res.status(200).json({
      company: admin.company || admin.subject || admin.domain || "",
      adminInterviewId: admin._id,
      totalQuestions: admin.no_of_questions
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}


export const fetchInterviewStatusCount = async (req, res) => {
  try {
    //add the count of all the interviews

    const companyInterviews = await AdminCompanyInterview.find({});
    const subjectInterviews = await AdminSubjectInterview.find({});
    const verbalInterviews = await AdminVerbalInterview.find({});
    const writtenInterviews = await AdminWrittenInterview.find({});
    const totalInterviews = companyInterviews.length + subjectInterviews.length + verbalInterviews.length + writtenInterviews.length;

    // check the count of all the interviews that have ended
    let endedInterview = 0;

    for (let i = 0; i < companyInterviews.length; i++) {
      const interview = companyInterviews[i];
      const currentTime = new Date();
      const endTime = new Date((interview.date + 'T' + interview.to).replace(/T\d{2}:\d{2}/, ''));
      // console.log(endTime);


      if (currentTime > endTime) {
        endedInterview++;
      }
    }

    for (let i = 0; i < subjectInterviews.length; i++) {
      const interview = subjectInterviews[i];
      const currentTime = new Date();
      const endTime = new Date((interview.date + 'T' + interview.to).replace(/T\d{2}:\d{2}/, ''));
      if (currentTime > endTime) {
        endedInterview++;
      }
    }

    for (let i = 0; i < verbalInterviews.length; i++) {
      const interview = verbalInterviews[i];
      const currentTime = new Date();
      const endTime = new Date((interview.date + 'T' + interview.to).replace(/T\d{2}:\d{2}/, ''));
      if (currentTime > endTime) {
        endedInterview++;
      }
    }

    for (let i = 0; i < writtenInterviews.length; i++) {
      const interview = writtenInterviews[i];
      const currentTime = new Date();
      const endTime = new Date((interview.date + 'T' + interview.to).replace(/T\d{2}:\d{2}/, ''));
      if (currentTime > endTime) {
        endedInterview++;
      }
    }

    let pendingInterviews = totalInterviews - endedInterview;

    // console.log(totalInterviews, endedInterview, pendingInterviews);

    res.status(200).json({totalInterviews, endedInterview, pendingInterviews});


  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

export const fetchInterviewDetails = async (req, res) => {
  try {
    // take all 4 interview types and sort it by latest date and time
    const {page, limit} = req.body;
    const companyInterviews = await AdminCompanyInterview.find({});
    const subjectInterviews = await AdminSubjectInterview.find({});
    const verbalInterviews = await AdminVerbalInterview.find({});
    const writtenInterviews = await AdminWrittenInterview.find({});
    const allInterviews = companyInterviews.concat(subjectInterviews, verbalInterviews, writtenInterviews);

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

    res.status(200).json({interviews});

  } catch (error) {
    res.status(500).json({message: error.message});
  }
}


// deprecated by krish
export const fetchInterviewByID = async (req, res) => {
  try{
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json(ApiError(404, "Interview ID not sent"))
    }

    const interview = await AdminSvarInterview.findOne({
      interview: interviewId
    })

    if(!interview){
      return res.status(400).json(ApiError(400, "Interview not found!"));
    }

    return res.status(200).json(new ApiResponse(200, interview, "Interview Fetched Successfully"));
  } catch(err) {
    return res.status(500).json({
      message: "Internal Server Error" || err.message
    })
  }
}
// ---------------------- CRUD Operations ----------------------

export async function getInterviewByID(interviewId) {
  const adminCompanyInterview = await AdminCompanyInterview.findById(interviewId);
  const adminSubjectInterview = await AdminSubjectInterview.findById(interviewId);
  const adminVerbalInterview = await AdminVerbalInterview.findById(interviewId);
  const adminWrittenInterview = await AdminWrittenInterview.findById(interviewId);
  const adminSvarInterview = await AdminSvarInterview.findById(interviewId);
  return adminCompanyInterview || adminSubjectInterview || adminVerbalInterview || adminWrittenInterview || adminSvarInterview;
}


export async function getAllInterviews() {
  const adminCompanyInterview = await AdminCompanyInterview.find({});
  const adminSubjectInterview = await AdminSubjectInterview.find({});
  const adminVerbalInterview = await AdminVerbalInterview.find({});
  const adminWrittenInterview = await AdminWrittenInterview.find({});
  const adminSvarInterview = await AdminSvarInterview.find({});
  return adminCompanyInterview.concat(adminSubjectInterview, adminVerbalInterview, adminWrittenInterview, adminSvarInterview);
}


// ---------------------- Download Attendance ----------------------

export const downloadAttendance = async (req, res) => {
  try {
    const interviewId = req.query.interviewId;
    if (!interviewId) return res.status(404).json({message: "id is required"});

    let interviews = []
    if (typeof interviewId === "string") {
      const interview = await getInterviewByID(interviewId);
      if (!interview) {
        return res.status(404).json({message: "Interview not found"});
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

    const pipeline = [
      // Stage 1: Match specific start_time and is_active false
      {
        $match: {
          _id: {$in: interviews},
        }
      },
      // Stage 2: Project the _id field of the interviews
      {
        $project: {_id: 1, is_active: 1}
      },
      // Stage 3: Lookup in students collection using interview _id
      {
        $lookup: {
          from: "students",
          let: {interviewId: "$_id"},
          pipeline: [
            {
              $match: {
                $expr: {$in: ["$$interviewId", "$interview_taken"]}
              }
            }
          ],
          as: "matched_students"
        }
      },
      // Stage 4: Unwind the matched_students array
      {
        $unwind: "$matched_students"
      },
      // Stage 5: Project the user_id from matched students
      {
        $project: {
          user_id: "$matched_students.user",
          is_active: 1
        }
      },
      // Stage 6: Lookup in users collection using user_id
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_data"
        }
      },
      // Stage 7: Unwind the user_data array
      {
        $unwind: "$user_data"
      },
      // Stage 8: Project the email, name, and _id from user_data
      {
        $project: {
          email: "$user_data.email_id",
          name: "$user_data.name",
          _id: "$user_data._id",
          is_active: 1
        }
      },
      // Stage 9: Group results and include count
      {
        $group: {
          _id: null,
          emails: {$push: {Email: "$email", Name: "$name", Id: "$_id", Present: {$not: "$is_active"}}},
          total_count: {$sum: 1}
        }
      }
    ]

    const students = await Interview.aggregate(pipeline);

    const fields = ['Email', 'Name', 'Id', 'Present'];
    const opts = {fields};
    const parser = new Parser(opts);
    let arr = [];
    if (students.length > 0) {
      arr = students[0].emails;
    }
    const csv = parser.parse(arr);
    res.setHeader('Content-Type', 'text/csv');
    const filename = typeof interviewId === "string" ? `interview_${interviewId}.csv` : `interviews_${interviewId.join('-')}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);

  } catch (error) {
    console.log(error);
    res.status(500).json({message: error.message});
  }

}
