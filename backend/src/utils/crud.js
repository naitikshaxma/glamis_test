import {
  AdminCompanyInterview,
  AdminSubjectInterview, AdminSvarInterview,
  AdminVerbalInterview, AdminWrittenInterview,
  SessionQuestions
} from "../models/interview.models.js";

export const saveSessionQuestions = async (interviewId, question) => {
  // check if session question exists if yes then update it else create a new one
  const existingSessionQuestion = await SessionQuestions.findOne({interview: interviewId});
  if (existingSessionQuestion) {
    existingSessionQuestion.question = question;
    await existingSessionQuestion.save();
  } else {
    await SessionQuestions.create({
      interview: interviewId,
      question
    });
  }
}


export const getSessionQuestions = async (interviewId) => {
  const sessionQuestion = await SessionQuestions.findOne({
    interview: interviewId
  });
  return sessionQuestion.question;
}


export const getAllAdminInterviews = async (query) => {
    const adminCompanyInterview = await AdminCompanyInterview.find(query);
  const adminSubjectInterview = await AdminSubjectInterview.find(query);
  const adminVerbalInterview = await AdminVerbalInterview.find(query);
  const adminWrittenInterview = await AdminWrittenInterview.find(query);
  const adminSvarInterview = await AdminSvarInterview.find(query);
  return adminCompanyInterview.concat(adminSubjectInterview, adminVerbalInterview, adminWrittenInterview, adminSvarInterview);
}

export const getAdminInterview = async (query) => {
  const adminCompanyInterview = await AdminCompanyInterview.findOne(query);
  const adminSubjectInterview = await AdminSubjectInterview.findOne(query);
  const adminVerbalInterview = await AdminVerbalInterview.findOne(query);
  const adminWrittenInterview = await AdminWrittenInterview.findOne(query);
  const adminSvarInterview = await AdminSvarInterview.findOne(query);
  return adminCompanyInterview || adminSubjectInterview || adminVerbalInterview || adminWrittenInterview || adminSvarInterview;
}


