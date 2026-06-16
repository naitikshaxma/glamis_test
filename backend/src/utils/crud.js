import {
  AdminInterview,
  SessionQuestions
} from "../models/interview.models.js";

export const saveSessionQuestions = async (interviewId, questionNo, question) => {
  // check if session question exists if yes then update it else create a new one
  const existingSessionQuestion = await SessionQuestions.findOne({interview: interviewId, questionNo});
  if (existingSessionQuestion) {
    existingSessionQuestion.question = question;
    await existingSessionQuestion.save();
  } else {
    await SessionQuestions.create({
      interview: interviewId,
      questionNo,
      question
    });
  }
}


export const getSessionQuestions = async (interviewId, questionNo) => {
  const sessionQuestion = await SessionQuestions.findOne({
    interview: interviewId,
    questionNo
  });
  if (!sessionQuestion) {
    throw new Error("Session question not found");
  }
  return sessionQuestion.question;
}

export const deleteSessionQuestions = async (interviewId) => {
    await SessionQuestions.deleteMany({interview: interviewId});
}


export const getAllAdminInterviews = async (query) => {
  return await AdminInterview.find(query);
}

export const getAdminInterview = async (query) => {
  return await AdminInterview.findOne(query);
}


