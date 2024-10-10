import {SessionQuestions} from "../models/interview.models.js";

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
