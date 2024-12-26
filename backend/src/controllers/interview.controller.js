import fs from "fs";
import OpenAI from "openai";
import path from "path";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {
  AdminSubjectInterview,
  AdminSvarInterview,
  AdminVerbalInterview,
  AdminWrittenInterview,
  Interview,
  InterviewQuestion,
} from "../models/interview.models.js"
import {Student} from "../models/users.models.js"
import "dotenv/config.js";
import {ApiError} from "../utils/ApiError.js";
import connectRedis from "../db/redis.connect.js"
import generateQuestionsPrompt from "../utils/prompts/generateQuestions.js";
import generateQuestionsPromptForJD from "../utils/prompts/generateQuestionsForJD.js"
import generateQuestionsPromptForWritten from "../utils/prompts/generateQuestionsForWritten.js";
import {AdminCompanyInterview, InterviewQuestionsByAdmin} from "../models/interview.models.js";
import {getAdminInterview, getSessionQuestions, saveSessionQuestions} from "../utils/crud.js";


const objectStorePath = path.resolve("../objectStore");
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});


/*
In use: reviewed by new interns that it is being used
not explored yet: new interns have not explored this yet or not sure about its usage
 */


// ---------------------------- Create Interview ----------------------------

// not explored yet
export const createInterview = asyncHandler(async (req, res) => {
  try {
    const {subject} = req.body;
    console.log("subject ####", subject);
    const interview = await Interview.create({
      start_time: new Date(), is_active: true, title: subject, description: subject
    })

    console.log("Interview created ####", interview);

    const currentUser = req.user;
    console.log("currentUser ####", currentUser);
    const student = await Student.findOne({user: currentUser._id});
    console.log("student ####", student);
    student.interview_taken.push(interview._id);
    await student.save();
    try {
      let redisClient = await connectRedis()
      await redisClient.set(String(interview._id), JSON.stringify([]));
      // redisClient.expire(email_id, 600);
    } catch (error) {
      console.log("Error while connecting to Redis", error)
      return res.status(500).json(ApiError(500, error.message || "Internal Server Error"));
    }

    return res.status(200).json(new ApiResponse(200, interview, "Interview created successfully"));
  } catch (err) {
    return res.status(500).json(ApiError(500, err.message || "Internal Server Error"));
  }
});


// not explored yet
export const createInterviewByJD = asyncHandler(async (req, res) => {
  try {
    const {selectedCompany, jobTitle} = req.body;
    const interview = await Interview.create({
      start_time: new Date(), is_active: true, title: jobTitle, description: selectedCompany + " " + jobTitle,
    });

    console.log("Interview created ####", interview);

    const currentUser = req.user;
    console.log("currentUser ####", currentUser);
    const student = await Student.findOne({user: currentUser._id});
    console.log("student ####", student);
    student.interview_taken.push(interview._id);
    await student.save();

    try {
      let redisClient = await connectRedis();
      await redisClient.set(String(interview._id), JSON.stringify([]));
    } catch (error) {
      console.log("Error while connecting to Redis", error);
      return res.status(500).json(ApiError(500, error.message || "Internal Server Error"));
    }

    return res.status(200).json(new ApiResponse(200, interview, "Interview created successfully"));
  } catch (err) {
    return res.status(500).json(ApiError(500, err.message || "Internal Server Error"));
  }
});


// in use
export const createInterviewByVerbalAdmin = asyncHandler(async (req, res) => {
  /*
  Handle the creation of an interview when user clicks on "Join Interview" button in a Verbal interview card
  */

  const {interviewId} = req.body;
  const interview = await Interview.findById(interviewId);
  if (interview === null) {
    return res.status(404).json(ApiError(404, "Interview not found"));
  }
  try {
    let redisClient = await connectRedis();
    await redisClient.set(String(interview._id), JSON.stringify([]));
  } catch (error) {
    console.log("Error while connecting to Redis", error);
    return res.status(500).json(ApiError(500, error.message || "Internal Server Error"));
  }
  return res.status(200).json(new ApiResponse(200, interview, "Interview created successfully"));
});


// in use
export const createInterviewByJDAdmin = asyncHandler(async (req, res) => {
  /*
  Handle the creation of an interview when user clicks on "Join Interview" button in a JD interview card
  */

  try {
    const {interviewId} = req.body;
    let redisClient = await connectRedis();
    await redisClient.set(String(interviewId), JSON.stringify([]));
    return res.status(200).json(new ApiResponse(200, {}, "Interview created successfully"));
  } catch (error) {
    console.log("Error while connecting to Redis", error);
    return res.status(500).json(ApiError(500, error.message || "Internal Server Error"));
  }

})


// in use
export const createInterviewByWrittenAdmin = asyncHandler(async (req, res) => {
  /*
  Handle the creation of an interview when user clicks on "Join Interview" button in a Written interview card
   */
  try {
    const {interviewId} = req.body;
    const interview = await Interview.findById(interviewId);

    if (interview === null) {
      return res.status(404).json(ApiError(404, "Interview not found"));
    }

    let redisClient = await connectRedis();

    await redisClient.set(String(interviewId), JSON.stringify([]));

    return res.status(200).json(new ApiResponse(200, {}, "Interview created successfully"));
  } catch (error) {
    console.log("Error while connecting to Redis", error);
    return res.status(500).json(ApiError(500, error.message || "Internal Server Error"));
  }
})

// in use
export const createInterviewBySvarAdmin = asyncHandler(async (req, res) => {
  /*
  Handle the creation of an interview when user clicks on "Join Interview" button in a Written interview card
   */
  try {
    const {interviewId} = req.body;
    const interview = await Interview.findById(interviewId);

    if (interview === null) {
      return res.status(404).json(ApiError(404, "Interview not found"));
    }

    let redisClient = await connectRedis();

    await redisClient.set(String(interviewId), JSON.stringify([]));

    return res.status(200).json(new ApiResponse(200, {}, "Interview created successfully"));
  } catch (error) {
    console.log("Error while connecting to Redis", error);
    return res.status(500).json(ApiError(500, error.message || "Internal Server Error"));
  }
})


// ---------------------------- Generate Question ----------------------------

const timerObject = {
  Easy: 60,
  Medium: 90,
  Hard: 90,
  essay: 20 * 60,
  jumbled: 40,  // for both written and svar
  errorDetection: 40,
  fillInTheBlanks: 40,
  synonymsAndAntonyms: 40,
  reading: 30,
  repeating: 40,
  short: 40,
  comprehension: 120
}


const PromptObject = ({type, historyPrompt, difficulty}) => (
  {
    JD: {},
    Written: {},
    Subject: {
      Easy: `${historyPrompt}\nGenerate a new, entirely different ${difficulty} question covering a different DSA topic without repeating previous areas of ${historyPrompt}. Limit the question to 25 words.`,
      Medium: `${historyPrompt}\nBased on the previous questions and answers, present the user with a complex and tricky code snippet that is completely different from the previous question. Ask the user to carefully analyze the code, explain the logic, and predict the output.without asking user to write any code. The question should involve intricate DSA concepts such as recursion, dynamic programming, or graph traversal:\n\n\`\`\`java\n// Complex Java code snippet here\n\`\`\``,
      Hard: `${historyPrompt}\nBased on the previous questions and answers, generate a completely new and highly challenging ${difficulty} level scenario-based question in DSA. The scenario should require the user to think critically about advanced concepts like algorithm optimization or space-time complexity analysis, and it should be distinct from any previous questions.`,
    },
    Verbal: {},
    Svar: {},
  }[type][difficulty]
)


export const generateQuestion = asyncHandler(async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
  });
  const {subject, answer, score, interviewId} = req.body;

  let redisClient = await connectRedis()

  // Add the current question and answer to the conversation history
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));
  console.log(typeof conversationHistory, ",", conversationHistory, ",", conversationHistory.length)
  if (conversationHistory.length > 0) {
    console.log("conversationHistory ####", conversationHistory);

    conversationHistory.push({
      answer: answer, score: score
    })
    console.log("###########", conversationHistory);
  } else {
    conversationHistory.push({subject});
  }
  await redisClient.set(interviewId, JSON.stringify(conversationHistory));
  console.log(conversationHistory + "????")

  // Adjust difficulty based on score
  let difficulty = "Medium";
  if (score >= 70) {
    difficulty = "Hard";
  } else if (score < 40) {
    difficulty = "Easy";
  }

  // Create a prompt with conversation history
  const historyPrompt = conversationHistory.map((interaction, index) => {
    return `Q${index + 1}: ${interaction.subject}\nA${index + 1}: ${interaction.answer || ''}`;
  }).join("\n");

  let prompt = generateQuestionsPrompt(subject, conversationHistory, historyPrompt, difficulty);

  prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent.";

  const completion = await openai.chat.completions.create({
    messages: [{role: "system", content: "You are a helpful assistant."}, {role: "user", content: prompt}],
    model: "gpt-4o-mini",
    max_tokens: 1000,
  });

  const question = completion.choices[0].message.content.trim();

  const audioFileName = `question-${generateUniqueKey()}.mp3`;
  const audioFilePath = path.join(objectStorePath, audioFileName);

  console.log(audioFilePath, "########")

  const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
  await textToSpeech(cleanedQuestion, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {
    return res.status(500).json({error: 'Failed to generate audio'});
  }

  const dataToSend = {
    question, audioFileName: audioFileName
  }

  return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
});

export const generateQuestionForWritten = asyncHandler(async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const {subject, interviewId} = req.body;

  let redisClient = await connectRedis();

  // Add the current question and answer to the conversation history
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));
  if (conversationHistory.length > 0) {
    conversationHistory.push({
      subject
    });
  } else {
    conversationHistory.push({subject});
  }
  await redisClient.set(interviewId, JSON.stringify(conversationHistory));

  let prompt = generateQuestionsPromptForWritten(subject);

  prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent. Question should be under 100 words.";

  const completion = await openai.chat.completions.create({
    messages: [{role: "system", content: "You are an English professor."}, {role: "user", content: prompt}],
    model: "gpt-4o-mini",
    max_tokens: 1000,
  });

  const question = completion.choices[0].message.content.trim();

  const audioFileName = `question-${generateUniqueKey()}.mp3`;
  const audioFilePath = path.join(objectStorePath, audioFileName);

  const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
  await textToSpeech(cleanedQuestion, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {
    return res.status(500).json({error: 'Failed to generate audio'});
  }

  const dataToSend = {
    question, audioFileName: audioFileName
  };

  return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
});

export const generateQuestionForJD = asyncHandler(async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const {selectedCompany, jobTitle, jdDetails, answer, score, interviewId} = req.body; // difficulty

  let redisClient = await connectRedis();

  // Add the current question and answer to the conversation history
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));
  if (conversationHistory.length > 0) {
    conversationHistory.push({
      answer: answer, score: score
    });
  } else {
    conversationHistory.push({selectedCompany, jobTitle, jdDetails});
  }
  await redisClient.set(interviewId, JSON.stringify(conversationHistory));

  // Adjust difficulty based on score
  let difficulty = "Medium";
  if (score >= 70) {
    difficulty = "Hard";
  } else if (score < 40) {
    difficulty = "Easy";
  }

  // Create a prompt with conversation history
  const historyPrompt = conversationHistory.map((interaction, index) => {
    return `Q${index + 1}: ${interaction.jobTitle} - \nA${index + 1}: ${interaction.answer || ''}`;
  }).join("\n");

  let prompt = generateQuestionsPromptForJD(selectedCompany, jobTitle, historyPrompt, conversationHistory);

  prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent.";

  const completion = await openai.chat.completions.create({
    messages: [{role: "system", content: "You are a helpful assistant."}, {role: "user", content: prompt}],
    model: "gpt-4o-mini",
    max_tokens: 1000,
  });

  const question = completion.choices[0].message.content.trim();

  const audioFileName = `question-${generateUniqueKey()}.mp3`;
  const audioFilePath = path.join(objectStorePath, audioFileName);

  const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
  await textToSpeech(cleanedQuestion, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {
    return res.status(500).json({error: 'Failed to generate audio'});
  }

  const dataToSend = {
    question, audioFileName: audioFileName
  };

  console.log("Conversation History: ", conversationHistory)
  return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
});


export const generateQuestionForJDAdmin = asyncHandler(async (req, res) => {
  let timer = 90;
  console.log("entered jd admin")
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
  const {selectedCompany, jobTitle, jdDetails, answer, score, interviewId, questionNo, adminInterviewId} = req.body;
  // const [offset, setOffset] = useState(0);
  const noOfAttemptedQuestions = await InterviewQuestion.find({interview: interviewId}).countDocuments();

  // questionNo += offset;

  console.log(req.body);

  let redisClient = await connectRedis();
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));
  console.log("connected redis")

  if (conversationHistory.length > 0) {
    conversationHistory.push({
      answer: answer, score: score
    });
  } else {
    conversationHistory.push({selectedCompany, jobTitle, jdDetails});
  }
  await redisClient.set(interviewId, JSON.stringify(conversationHistory));

  // setOffset(noOfAttemptedQuestions);
  let historyPrompt = conversationHistory.map((interaction, index) => {
    return `Q${index + 1}: ${interaction.jobTitle} - \nA${index + 1}: `;
  }).join("\n");

  const lastQuestion = await InterviewQuestion.find({interview: interviewId});

  historyPrompt += lastQuestion[lastQuestion.length - 1]?.question;


  const adminInterview = await AdminCompanyInterview.findOne({interview: interviewId}).populate('interview');

  if (adminInterview === null) {
    return res.status(404).json(ApiError(404, "Interview not found"));
  }


  console.log('wow')
  let difficulty = '';
  if (adminInterview.easy_remaining > questionNo) {
    difficulty = 'Easy';
  } else if (adminInterview.medium_remaining + adminInterview.easy_remaining > questionNo) {
    difficulty = 'Medium';
  } else {
    difficulty = 'Hard';
  }

  // if difficulty is Easy and no of questions are less than easy_remaining then fetch the question from db

  if (difficulty === "Easy") {
    timer = 60;  // 60 seconds
    const easyQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Easy", _id: {$in: adminInterview.questions}
    });
    if (questionNo < easyQuestions.length) {
      const question = easyQuestions[questionNo].question;
      console.log(question)
      console.log(easyQuestions)

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }

      const dataToSend = {
        timer,
        question, // gamma: noOfAttemptedQuestions,
        audioFileName: audioFileName, difficulty
      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
    }
  }

  if (difficulty === "Medium") {
    timer = 90;  // 60 seconds
    const mediumQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Medium", _id: {$in: adminInterview.questions}
    });
    console.log("______________________________\n" + mediumQuestions + "\n_______________________________________")
    if (questionNo - adminInterview.easy_remaining < mediumQuestions.length) {
      const question = mediumQuestions[questionNo - adminInterview.easy_remaining].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }

      const dataToSend = {
        question,
        audioFileName: audioFileName,
        difficulty,
        timer
      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
    }
  }

  if (difficulty === "Hard") {
    timer = 90;  // 90 seconds
    const hardQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Hard", _id: {$in: adminInterview.questions}
    });
    if (questionNo - (adminInterview.easy_remaining + adminInterview.medium_remaining) < hardQuestions.length) {
      const question = hardQuestions[questionNo - (adminInterview.easy_remaining + adminInterview.medium_remaining)].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }

      const dataToSend = {
        question,
        audioFileName: audioFileName,
        difficulty,
        timer
      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
    }
  }
  console.log("______________________________\n" + jdDetails + "\n_______________________________________")
  // let prompt = "";
  // if (difficulty === "Easy") {
  //     prompt = `Based on the previous questions and answers, generate a straightforward and generic question related to the job title ${jobTitle} for ${selectedCompany}. The question should be directly related to the job description keywords , they can be related to particular core cs subjects and not involve coding or complex scenarios.And concider the hole jd not the first line\n\nJob Description: ${jdDetails}`
  // } else if (difficulty === "Medium") {
  //     prompt = `Based on the previous questions and answers, generate a new coding question for a ${jobTitle} interview at ${selectedCompany}. Provide a code snippet and ask the user to solve the problem or explain the code:\n\n\`\`\`java\n// Your code snippet here\n\`\`\`\n\nEnsure the question is relevant to the job description and appropriately challenging.\n\nJob Description: ${jdDetails}`
  // } else {
  //     prompt = `Based on the previous questions and answers, generate a scenario-based question for a ${jobTitle} interview at ${selectedCompany}. The question should involve real-world tasks and challenges directly related to the job description and role.\n\nJob Description: ${jdDetails}`
  // }

  // prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent. THe length of the question should be less than 100 words.";

  let prompt = "";
  if (difficulty === "Easy") {
    prompt = `Based on the previous questions and answers (${historyPrompt}), generate a straightforward and generic question related to the job title ${jobTitle} for ${selectedCompany}. Ensure that this question is distinct from the previous one and covers topics that have not yet been addressed or have been underrepresented so far.Without asking the user to write code. Focus on core CS subjects without involving coding or complex scenarios. Consider the entire job description, not just the first line.\n\nJob Description: ${jdDetails}`;
  } else if (difficulty === "Medium") {
    // Initialize the question counter within this block
    //   let questionCount = 0;

    // Randomly decide whether to generate a coding or a numerical question
    //console.log(questionType);

    if (questionNo >= 5 && questionNo < 7) {
      // First two questions are coding questions
      prompt = `Considering the previous questions and answers (${historyPrompt}), generate a new coding question for ${jobTitle} at ${selectedCompany}. 
        Ensure the coding question is different from the previous one, introducing a new concept or challenge not yet fully explored in the interview.
        - **Coding**: Provide a verbal coding challenge where the user is asked to solve the problem, identify errors, or explain the code, without writing any code. without asking user to write any code.
        The question should use pseudocode and be complex and tricky, allowing the user to answer verbally, such as predicting the output, explaining the approach, or detecting errors.
        
        \n\nJob Description: ${jdDetails}\nPlease do proper indentation and formatting of the question.
        - The coding question should have a word limit of 50, and the pseudocode block should have a word limit of 70.`;

      // Increment the question count after asking a coding question
      //questionCount++;
    } else if (questionNo >= 7 && questionNo < 9) {
      // The next two questions are numerical
      prompt = `Considering the previous questions and answers (${historyPrompt}), generate a new numerical question for ${jobTitle} at ${selectedCompany}.
        Ensure this numerical question is different from the previous one, introducing a new concept or challenge not yet fully explored in the interview.
        - **Numerical**: Include a numerical question from relevant topics like Computer Networks, Operating Systems, or Database Management Systems. The numerical question should focus on the job description and be appropriately complex.
        
        \n\nJob Description: ${jdDetails}\nPlease ensure proper formatting of the numerical question.
        - The numerical question should focus on OS, CN, or DBMS topics (e.g., SQL queries), and should not exceed 70 words.`;

      // Increment the question count after asking a numerical question
      //questionCount++;
    } else {
      // From the 5th question onward, ask DBMS query questions verbally
      prompt = `Considering the previous questions and answers (${historyPrompt}), generate a verbal SQL query-related question for a ${jobTitle} interview at ${selectedCompany}, based on the job description ${jdDetails}.
            The question should test knowledge of Database Management Systems and SQL, focusing on challenging scenarios like joins, subqueries, or optimizations.
            - **DBMS Query (Verbal)**: Ask the candidate to verbally explain how they would approach or solve a particular SQL-related problem, without asking them to write the actual query. 
            The question should focus on SQL concepts such as understanding joins, subqueries, or query optimization techniques, and should allow the candidate to explain their approach.
            
            \n\nJob Description: ${jdDetails}\nPlease ensure proper formatting and clarity. The verbal question should have a word limit of 70 words.`;
    }
  } else {
    prompt = `Taking into account the previous questions and answers (${historyPrompt}), generate a scenario-based question for a ${jobTitle} interview at ${selectedCompany}. Ensure that the scenario is different from previous ones, covering real-world tasks and challenges directly related to the job description and role. Address any topics or areas that have not been fully explored in previous questions. The scenario should be practical, relevant to the job description, and should be between 30 to 70 words in length.Without asking the user to write code.\n\nJob Description: ${jdDetails}`;
  }

// Instruction to only generate and send the question
  prompt += " Only generate and send the question text. Do not include the answer or any additional information.";


  const completion = await openai.chat.completions.create({
    messages: [{role: "system", content: "You are a helpful assistant."}, {role: "user", content: prompt}],
    model: "gpt-4o-mini",
    max_tokens: 1000,
  });

  const question = completion.choices[0].message.content.trim();

  const audioFileName = `question-${generateUniqueKey()}.mp3`;
  const audioFilePath = path.join(objectStorePath, audioFileName);

  const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
  await textToSpeech(cleanedQuestion, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {
    return res.status(500).json({error: 'Failed to generate audio'});
  }

  const dataToSend = {
    question,
    audioFileName: audioFileName,
    difficulty,
    timer
  };

  return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

});

export const generateQuestionForVerbalAdmin = asyncHandler(async (req, res) => {
  let timer = 90;
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
  const {answer, score, interviewId, questionNo, adminInterviewId} = req.body;
  console.log(req.body);

  let redisClient = await connectRedis();
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));
  console.log("connected redis")

  if (conversationHistory.length > 0) {
    conversationHistory.push({
      answer: answer, score: score
    });
  } else {
    conversationHistory.push({verbal: true});
  }
  await redisClient.set(interviewId, JSON.stringify(conversationHistory));

  const historyPrompt = conversationHistory.map((interaction, index) => {
    return `Q${index + 1}: ${interaction.subject}\nA${index + 1}: ${interaction.answer || ''}`;
  }).join("\n");

  const adminInterview = await AdminVerbalInterview.findOne({interview: interviewId}).populate('interview');


  if (adminInterview === null) {
    return res.status(404).json(ApiError(404, "Interview not found"));
  }

  console.log('wow')

  console.log(questionNo);

  let difficulty = '';

  console.log(adminInterview.easy, adminInterview.medium, adminInterview.hard);

  if (adminInterview.easy > questionNo) {
    difficulty = 'Easy';
  } else if (adminInterview.medium + adminInterview.easy > questionNo) {
    difficulty = 'Medium';
  } else {
    difficulty = 'Hard';
  }

  console.log("Difficulty: ", difficulty);

  // if difficulty is Easy and no of questions are less than easy_remaining then fetch the question from db

  if (difficulty === "Easy") {
    timer = 60;  // 60 seconds

    const easyQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Easy", _id: {$in: adminInterview.questions}
    });
    console.log("Easy Questions: ", easyQuestions);
    if (questionNo < easyQuestions.length) {
      const question = easyQuestions[questionNo].question;
      console.log(question)
      console.log(easyQuestions)

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }

      const dataToSend = {
        question,
        audioFileName: audioFileName,
        difficulty,
        timer
      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

    }
  }

  if (difficulty === "Medium") {
    timer = 90;  // 60 seconds
    const mediumQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Medium", _id: {$in: adminInterview.questions}
    });

    console.log("Medium Questions: ", mediumQuestions);

    if (questionNo - adminInterview.easy < mediumQuestions.length) {
      const question = mediumQuestions[questionNo - adminInterview.easy].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {

        return res.status(500).json({error: 'Failed to generate audio'});

      }

      const dataToSend = {

        question,
        timer,
        audioFileName: audioFileName

      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

    }

  }

  if (difficulty === "Hard") {
    timer = 90;  // 90 seconds
    const hardQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Hard", _id: {$in: adminInterview.questions}
    });

    console.log("Hard Questions: ", hardQuestions);

    if (questionNo - (adminInterview.easy + adminInterview.medium) < hardQuestions.length) {

      const question = hardQuestions[questionNo - (adminInterview.easy + adminInterview.medium)].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {

        return res.status(500).json({error: 'Failed to generate audio'});

      }

      const dataToSend = {

        question,
        timer,
        audioFileName: audioFileName

      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

    }

  }

  let prompt = "";

  console.log("History Prompt: ", historyPrompt);

  if (difficulty === "Easy") {
    prompt = `Based on the previous questions and answers (${historyPrompt}), generate a simple and straightforward question related to the candidate's personal background. Examples include:
        - "Can you introduce yourself?"
        - "What are your greatest strengths?"
        - "What are your hobbies and interests?"
        Ensure that the question encourages the candidate to share more about themselves in a comfortable manner. The new question should be distinct from the previous ones and flow naturally from the conversation.`;
  } else if (difficulty === "Medium") {
    prompt = `Considering the previous questions and answers (${historyPrompt}), formulate a question that delves into the candidate's past experiences. Focus on detailed responses to questions like:
        - "Can you describe a challenging situation you faced and how you overcame it?"
        - "What is one of your most significant accomplishments?"
        - "Tell me about a time you had to deal with failure and what you learned from it."
        Make sure the new question explores a different aspect of their experience that hasn't been addressed before and encourages the candidate to reflect comprehensively.`;
  } else if (difficulty === "Hard") {
    prompt = `Taking into account the previous questions and answers (${historyPrompt}), craft a thought-provoking question that explores the candidate's perspectives and critical thinking. Topics can include:
        - "What are your views on the current trends in our industry?"
        - "How do you approach ethical dilemmas in the workplace?"
        - "Can you discuss your opinion on the importance of lifelong learning in your profession?"
        Ensure that the new question challenges the candidate to provide insightful and well-reasoned answers while covering areas that haven't been fully explored.`;
  } else {
    prompt = `Please specify a valid difficulty level: "Easy", "Medium", or "Hard".`;
  }


  prompt += `Generate only the question text without any additional explanations or context. The question you generate must include sections from ${answer}`;
  console.log(answer)

  const completion = await openai.chat.completions.create({

    messages: [

      {role: "system", content: "You are a helpful assistant."},

      {role: "user", content: prompt}

    ],

    model: "gpt-4o-mini",

    max_tokens: 1000,

  });

  const question = completion.choices[0].message.content.trim();

  const audioFileName = `question-${generateUniqueKey()}.mp3`;

  const audioFilePath = path.join(objectStorePath, audioFileName);

  const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

  await textToSpeech(cleanedQuestion, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {

    return res.status(500).json({error: 'Failed to generate audio'});

  }

  const dataToSend = {

    question,
    timer,
    audioFileName: audioFileName

  };

  return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

});


export const generateQuestionForWrittenAdmin = asyncHandler(async (req, res) => {
  let timer = 90;
  console.log("entered written admin")
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
  const {subject, answer, score, interviewId, questionNo, adminInterviewId} = req.body;

  let redisClient = await connectRedis();
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));
  console.log("connected redis")

  if (conversationHistory.length > 0) {
    conversationHistory.push({
      answer: answer, score: score
    });
  } else {
    conversationHistory.push({subject});
  }
  await redisClient.set(interviewId, JSON.stringify(conversationHistory));

  const adminInterview = await AdminWrittenInterview.findOne({interview: interviewId}).populate('interview');

  if (adminInterview === null) {
    return res.status(404).json(ApiError(404, "Interview not found"));
  }
  let difficulty;
  if (adminInterview.essay > questionNo) {
    difficulty = 'essay';
  } else if (adminInterview.jumbled + adminInterview.essay > questionNo) {
    difficulty = 'jumbled';
  } else if (adminInterview.errorDetection + adminInterview.jumbled + adminInterview.essay > questionNo) {
    difficulty = 'errorDetection';
  } else if (adminInterview.fillInTheBlanks + adminInterview.errorDetection + adminInterview.jumbled + admview.essay > questionNo) {
    difficulty = 'fillInTheBlanks';
  } else {
    difficulty = 'synonymsAndAntonyms';
  }

  // if difficulty is Easy and no of questions are less than easy_remaining then fetch the question from db

  if (difficulty === "essay") {
    timer = 20 * 60;  // 20 minutes
    const essayQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "essay", _id: {$in: adminInterview.questions}
    });
    if (questionNo < essayQuestions.length) {
      const question = essayQuestions[questionNo].question;
      console.log(question)
      console.log(essayQuestions)

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }

      const dataToSend = {
        question,
        timer,
        audioFileName: audioFileName

      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));


    }
  }

  if (difficulty === "jumbled") {
    timer = 40;  // 40 seconds
    const jumbledQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "jumbled", _id: {$in: adminInterview.questions}
    });
    if (questionNo - adminInterview.essay < jumbledQuestions.length) {
      const question = jumbledQuestions[questionNo - adminInterview.essay].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {

        return res.status(500).json({error: 'Failed to generate audio'});

      }

      const dataToSend = {
        question,
        timer,
        audioFileName: audioFileName

      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

    }
  }

  if (difficulty === "errorDetection") {
    timer = 40;  // 40 seconds

    const errorDetectionQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "errorDetection", _id: {$in: adminInterview.questions}
    });

    if (questionNo - (adminInterview.essay + adminInterview.jumbled) < errorDetectionQuestions.length) {

      const question = errorDetectionQuestions[questionNo - (adminInterview.essay + adminInterview.jumbled)].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {

        return res.status(500).json({error: 'Failed to generate audio'});

      }

      const dataToSend = {
        timer,
        question,
        audioFileName: audioFileName

      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));


    }
  }

  if (difficulty === "fillInTheBlanks") {
    timer = 40;  // 40 seconds

    const fillInTheBlanksQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "fillInTheBlanks", _id: {$in: adminInterview.questions}
    });

    if (questionNo - (adminInterview.essay + adminInterview.jumbled + adminInterview.errorDetection) < fillInTheBlanksQuestions.length) {

      const question = fillInTheBlanksQuestions[questionNo - (adminInterview.essay + adminInterview.jumbled + adminInterview.errorDetection)].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {

        return res.status(500).json({error: 'Failed to generate audio'});

      }

      const dataToSend = {
        timer,
        question,
        audioFileName: audioFileName

      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
    }
  }

  if (difficulty === "synonymsAndAntonyms") {
    timer = 40;  // 40 seconds

    const synonymsAndAntonymsQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "synonymsAndAntonyms", _id: {$in: adminInterview.questions}
    });

    if (questionNo - (adminInterview.essay + adminInterview.jumbled + adminInterview.errorDetection + adminInterview.fillInTheBlanks) < synonymsAndAntonymsQuestions.length) {

      const question = synonymsAndAntonymsQuestions[questionNo - (adminInterview.essay + adminInterview.jumbled + adminInterview.errorDetection + adminInterview.fillInTheBlanks)].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileName);

      const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {

        return res.status(500).json({error: 'Failed to generate audio'});

      }

      const dataToSend = {
        timer,
        question,
        audioFileName: audioFileName

      };

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

    }

  }


  let prompt;

  if (difficulty === "essay") {

    prompt = ` Write an essay on the topic ${subject}. The essay should be at least 200 words long and should be well-structured and coherent. Ensure that the essay is free of grammatical errors and is written in a formal tone.`

  } else if (difficulty === "jumbled") {

    prompt = `Based on the previous questions and answers, generate a jumbled sentence. The sentence should be related to the topic and should be challenging to unscramble. Provide the user with a hint to help them unscramble the sentence.`

  } else if (difficulty === "errorDetection") {

    prompt = `Based on the previous questions and answers, generate a sentence with an error. The sentence should be related to the topic and should contain a grammatical or spelling error. Provide the user with a hint to help them identify and correct the error. Please add "Identify the error" at the start of sentence.`
  } else if (difficulty === "fillInTheBlanks") {

    prompt = `Based on the previous questions and answers, generate a sentence with a blank space. The sentence should be related to the topic and should have a missing word or phrase. Provide the user with a hint to help them fill in the blank space.`
  } else {

    prompt = `Based on the previous questions and answers, generate a sentence with a word that needs to be replaced with a synonym or antonym. The sentence should be related to the topic and should contain a word that can be replaced with a synonym or antonym. Provide the user with a hint to help them identify the correct word and its synonym or antonym.`
  }

  prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent.";

  const completion = await openai.chat.completions.create({

    messages: [

      {role: "system", content: "You are an English professor."},

      {role: "user", content: prompt}

    ],

    model: "gpt-4o-mini",

    max_tokens: 1000,

  });

  const question = completion.choices[0].message.content.trim();

  const audioFileName = `question-${generateUniqueKey()}.mp3`;

  const audioFilePath = path.join(objectStorePath, audioFileName);

  const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

  await textToSpeech(cleanedQuestion, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {

    return res.status(500).json({error: 'Failed to generate audio'});

  }

  const dataToSend = {

    question,
    timer,
    audioFileName: audioFileName


  };

  return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));
});

export const generateQuestionForSubjectAdmin = asyncHandler(async (req, res) => {
  const {subject, answer, score, interviewId, questionNo, adminInterviewId} = req.body;

  let redisClient = await connectRedis();
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));

  if (conversationHistory.length > 0) {
    conversationHistory.push({
      answer: answer, score: score
    });
  } else {
    conversationHistory.push({subject});
  }
  await redisClient.set(interviewId, JSON.stringify(conversationHistory));

  const historyPrompt = conversationHistory.map((interaction, index) => {
    return `Q${index + 1}: ${interaction.subject}`;
  }).join("\n");


  console.log(interviewId)
  const adminInterview = await AdminSubjectInterview.findOne({interview: interviewId}).populate('interview');

  if (adminInterview === null) {
    return res.status(404).json(ApiError(404, "Interview not found"));
  }

  let difficulty;
  if (adminInterview.easy > questionNo) {
    difficulty = 'Easy';
  } else if (adminInterview.medium + adminInterview.easy > questionNo) {
    difficulty = 'Medium';
  } else {
    difficulty = 'Hard';
  }


  let questionData = "";
  let audioFileNameData = "";
  let storedQuestion = false;

  // logic for stored questions
  if (difficulty === "Easy") {
    const easyQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Easy", _id: {$in: adminInterview.questions}
    });
    if (questionNo < easyQuestions.length) {
      storedQuestion = true;
      questionData = easyQuestions[questionNo].question;
      audioFileNameData = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileNameData);
      const cleanedQuestion = questionData.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }
    }
  }

  if (difficulty === "Medium") {
    const mediumQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Medium", _id: {$in: adminInterview.questions}
    });
    console.log("______________________________\n" + mediumQuestions + "\n_______________________________________")
    if (questionNo - adminInterview.easy < mediumQuestions.length) {
      storedQuestion = true;
      questionData = mediumQuestions[questionNo - adminInterview.easy].question;
      audioFileNameData = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileNameData);
      const cleanedQuestion = questionData.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }
    }
  }

  if (difficulty === "Hard") {
    const hardQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "Hard", _id: {$in: adminInterview.questions}
    });
    if (questionNo - (adminInterview.easy + adminInterview.medium) < hardQuestions.length) {
      storedQuestion = true;
      questionData = hardQuestions[questionNo - (adminInterview.easy + adminInterview.medium)].question;
      audioFileNameData = `question-${generateUniqueKey()}.mp3`;

      const audioFilePath = path.join(objectStorePath, audioFileNameData);
      const cleanedQuestion = questionData.replace(/```[\s\S]*?```/g, '');
      await textToSpeech(cleanedQuestion, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }
    }
  }


  if (storedQuestion) {
    const context = {
      question: questionData,
      audioFileName: audioFileNameData,
      timer: timerObject[difficulty]
    }
    return res.status(200).json(new ApiResponse(200, context, "Question generated successfully"));
  }


  // logic for generated questions

  let prompt = PromptObject({
    type: "Subject",
    difficulty: difficulty,
    historyPrompt: historyPrompt
  })

  prompt = generateQuestionsPrompt(subject, conversationHistory, historyPrompt, difficulty);

  prompt += " Please ensure that only the question text is provided, without including any answers or explanations. The question should be less than 100 words in length.";


  const completion = await openai.chat.completions.create({
    messages: [{role: "system", content: "You are a helpful assistant."}, {role: "user", content: prompt}],
    model: "gpt-4o-mini",
    max_tokens: 1000,
  });

  questionData = completion.choices[0].message.content.trim();
  audioFileNameData = `question-${generateUniqueKey()}.mp3`;
  const audioFilePath = path.join(objectStorePath, audioFileNameData);

  const cleanedQuestion = questionData.replace(/```[\s\S]*?```/g, '');
  await textToSpeech(cleanedQuestion, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {
    return res.status(500).json({error: 'Failed to generate audio'});
  }

  const context = {
    question: questionData,
    audioFileName: audioFileNameData,
    timer: timerObject[difficulty]
  };

  return res.status(200).json(new ApiResponse(200, context, "Question generated successfully"));

});

export const generateQuestionforSvarAdmin = asyncHandler(async (req, res) => {
  let timer = 90;


  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
  const {svar, answer, score, interviewId, questionNo, adminInterviewId} = req.body;

  let redisClient = await connectRedis();
  let conversationHistory = JSON.parse(await redisClient.get(interviewId));

  if (conversationHistory.length > 0) {
    conversationHistory.push({
      answer, score
    })
  } else {
    conversationHistory.push({
      svar: svar
    })
  }

  await redisClient.set(interviewId, JSON.stringify(conversationHistory));

  const historyPrompt = conversationHistory.map((interaction, index) => { // putting this in prompts ?
    return `Q${index + 1}: ${interaction.svar}`;
  }).join("\n");


  const adminInterview = await AdminSvarInterview.findOne({interview: interviewId}).populate('interview');
  if (adminInterview == null) {
    res.status(404).json(ApiError(404, "Interview not found"));
  }

  let difficulty = '';
  if (adminInterview.reading > questionNo) {
    difficulty = 'reading';
  } else if (adminInterview.repeating + adminInterview.reading > questionNo) {
    difficulty = 'repeating';
  } else if (adminInterview.short + adminInterview.repeating + adminInterview.reading > questionNo) {
    difficulty = 'short'
  } else if (adminInterview.jumbled + adminInterview.short + adminInterview.repeating + adminInterview.reading > questionNo) {
    difficulty = 'jumbled'
  } else {
    difficulty = 'comprehension';
  }

  if (difficulty === 'reading') {
    timer = 30;
    const readingQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "reading", _id: {$in: adminInterview.questions}
    });
    if (questionNo < readingQuestions.length) {
      const question = readingQuestions[questionNo].question; // get the question from the admin questions
      

      const dataToSend = {
        question,
        difficulty,
        timer
      }  // only need to send the question since the audio file is not required for read and speak

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"))
    }
  }
  if (difficulty === "repeating") {
    timer = 40;
    const repeatingQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "repeating", _id: {$in: adminInterview.questions}
    })

    if ((questionNo - adminInterview.reading) < repeatingQuestions.length) {
      const question = repeatingQuestions[questionNo - adminInterview.repeating].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      await textToSpeech(question, audioFilePath); // directly convert the question since no coding questions will be here

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: 'Failed to generate audio'});
      }
      await saveSessionQuestions(interviewId, questionNo, question);


      const dataToSend = {
        audioFileName: audioFileName,
        difficulty,
        timer
      }

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

    }
  }

  if (difficulty === "short") {
    timer = 40;
    const shortQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "short", _id: {$in: adminInterview.questions}
    });

    if (questionNo - (adminInterview.repeating + adminInterview.reading) < shortQuestions.length) {
      const question = shortQuestions[questionNo - (adminInterview.repeating + adminInterview.reading)].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      await textToSpeech(question, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: "Failed to generate audio"})
      }
      ;
      await saveSessionQuestions(interviewId, questionNo, question);

      const dataToSend = {
        audioFileName: audioFileName,
        difficulty,
        timer
      }

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"))
    }
  }

  if (difficulty === "jumbled") {
    timer = 40;
    const jumbledQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "jumbled", _id: {$in: adminInterview.questions}
    })
    if (questionNo - (adminInterview.reading + adminInterview.repeating + adminInterview.short) < jumbledQuestions.length) {
      const question = jumbledQuestions[questionNo - (adminInterview.reading + adminInterview.repeating + adminInterview.short)].question;

      const audioFileName = `question-${generateUniqueKey()}.mp3`;
      const audioFilePath = path.join(objectStorePath, audioFileName);

      await textToSpeech(question, audioFilePath);

      if (!fs.existsSync(audioFilePath)) {
        return res.status(500).json({error: "Failed to generate audio"});
      }
      await saveSessionQuestions(interviewId, questionNo, question);

      const dataToSend = {
        audioFileName: audioFileName,
        difficulty,
        timer
      }

      return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"));

    }
  }

  if (difficulty === "comprehension") {
    timer = 120;
    const comprehensionQuestions = await InterviewQuestionsByAdmin.find({
      difficulty: "comprehension", _id: {$in: adminInterview.questions}
    });
    if (questionNo - (adminInterview.reading + adminInterview.repeating + adminInterview.jumbled + adminInterview.short) < comprehensionQuestions.length) {
      const question = comprehensionQuestions[questionNo - (adminInterview.reading + adminInterview.repeating + adminInterview.jumbled + adminInterview.short)].question;
      await saveSessionQuestions(interviewId, questionNo, question);

      const dataToSend = {

        question,
        difficulty,
        timer
      };

      res.status(200).json(new ApiResponse(200, dataToSend, "Question Generated Successfully"));
    }
  }

  let prompt = "";

  if (difficulty === "reading") {
    prompt = `
          Generate a single reading sentence for the user. The sentence should be no more than 20 words, simple, clear, and based on diverse topics such as sports, geopolitics, global warming, or any universal theme, or any thing that the user can read and speak."
          `;
  } else if (difficulty === "repeating") {
    prompt = `
          Generate a single sentence for the user to repeat. The sentence should be clear and concise, with a maximum length of 15 words, and inspired by diverse topics like cultural heritage, scientific discoveries, or environmental issues."
          `;
  } else if (difficulty === "short") {
    prompt = `
          Generate a single short comprehension question with two answer choices. The question should reflect diverse themes, such as global challenges, sports achievements, or historical events,or any simple question and the user should select between the two options."
          `;
  } else if (difficulty === "jumbled") {
    prompt = `
          Generate a single jumbled sentence for the user to unscramble into its correct order. The sentence should have fewer than 15 words and draw from diverse topics, including technological innovations, artistic movements, or natural phenomena."
          `;
  }
   else if (difficulty === "comprehension") {
    prompt = `Generate a passage of exactly 50 words for the user to comprehend. After the passage, generate one short comprehension questions based on the content. The answers to the questions should be brief and consist of just a few words."`
  }


  prompt += " Please ensure that only the question text is provided, without including any answers or explanations. The question should be less than 100 words in length.";

  const completion = await openai.chat.completions.create({
    messages: [{role: "system", content: "You are a helpful assistant."}, {role: "user", content: prompt}],
    model: "gpt-4o-mini",
    max_tokens: 1000,
  });

  const question = completion.choices[0].message.content.trim();

  if (difficulty === "reading" || difficulty === "comprehension") {
    await saveSessionQuestions(interviewId, questionNo, question);
    if(difficulty === "reading"){
      difficulty = "Read and Speak"
    }
    return res.status(200).json(new ApiResponse(200, {question, difficulty}, "Quesetion Generated Successfully"));
  }

  const audioFileName = `question-${generateUniqueKey()}.mp3`;
  const audioFilePath = path.join(objectStorePath, audioFileName);

  // const cleanedQuestion = question.replace(/```[\s\S]*?```/g, ''); // no need
  await textToSpeech(question, audioFilePath);

  if (!fs.existsSync(audioFilePath)) {
    return res.status(500).json({error: 'Failed to generate audio'});
  }
  await saveSessionQuestions(interviewId, questionNo, question);

  if(difficulty == "repeating"){
    difficulty = "Listen and Speak"
  }else if(difficulty == "short"){
    difficulty = "Choice Question"
  }else if(difficulty == "jumbled"){
    difficulty = "Jumbled Sentence"
  }
  const dataToSend = {
    audioFileName: audioFileName,
    difficulty,
    timer
  };

  return res.status(200).json(new ApiResponse(200, dataToSend, "Question generated successfully"))
})

// ---------------------------- Helper Functions ----------------------------

const generateUniqueKey = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function evaluateAnswerWithPrompt(answer, question) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
  });
  const prompt = `
    You are an interviewer. I will provide you with a question and its answer. Your task is to evaluate the answer on a scale of 0 to 100 and provide a detailed, constructive report covering both the strengths and weaknesses in each of the following areas. Be specific and thorough in your feedback, offering detailed analysis and examples where necessary.

    Here is the question: "${question}"
    Here is the answer: "${answer}"

    Please evaluate the answer based on the following criteria:
    1. Overall Score: An integer score out of 100 for the overall quality of the answer, taking into account all aspects (technical accuracy, clarity, grammar, etc.).
    2. Grammar: An integer score out of 100 for the grammatical correctness of the answer. Focus on sentence structure, verb tense, and clarity.
    3. Vocabulary: An integer score out of 100 for the vocabulary used in the answer, including spelling, word choice, and clarity of expression.
    4. technicalExplanation: A detailed evaluation of the technical content of the answer. Provide feedback on the accuracy, depth, and relevance of the technical knowledge displayed. Only the first or second point in pros or cons should be included.
    5. vocabularyExplanation: Detailed feedback on the vocabulary used in the answer. Analyze the choice of words, clarity, and appropriateness of vocabulary, with suggestions for improvement. Only the first or second point in pros or cons should be included.
    6. grammarExplanation: Feedback on the grammatical correctness of the answer. Point out strengths as well as errors, providing corrections and suggestions for improvement. Only the first or second point in pros or cons should be included.

    The response should be in JSON format and must follow this structure. Do not add any additional information, and ensure the keys are exactly as shown below. Ensure that there are no symbols like tilde so that I can parse it as JSON:
    {
        "question": "The question text",
        "userAnswer": "The user's answer text",
        "overallScore": 90,
        "vocabularyScore": 88,
        "grammarScore": 85,
        "technicalExplanation": {
            "Pros": "Detailed explanation of the strong points of the technical content.\nFirst Point: Accurate and relevant technical knowledge.\nSecond Point: Clear and logical explanation of concepts.\nThird Point: Detailed feedback\nand so on...",
            "Cons": "Detailed explanation of the weak points in the technical content and suggestions for improvement.\nFirst Point: Lack of depth in technical explanation.\nSecond Point: Incorrect interpretation of the key concept.\nThird Point: Detailed feedback\nand so on..."
        },
        "vocabularyExplanation": {
            "Pros": "Detailed explanation of strong points related to vocabulary.\nFirst Point: Effective use of technical terminology.\nSecond Point: Clear and precise word choice.\nThird Point: Detailed feedback\nand so on...",
            "Cons": "Detailed explanation of weak points in vocabulary and suggestions for improvement.\nFirst Point: Inappropriate word choice in certain contexts.\nSecond Point: Ambiguity in some word usage leading to confusion.\nThird Point: Detailed feedback\nand so on..."
        },
        "grammarExplanation": {
            "Pros": "Detailed explanation of the strong points in grammar.\nFirst Point: Correct use of verb tense and sentence structure.\nSecond Point: Clear and concise sentence formation.\nThird Point: Detailed feedback\nand so on...",
            "Cons": "Detailed explanation of grammatical errors and suggestions for improvement.\nFirst Point: Subject-verb agreement errors.\nSecond Point: Improper use of passive voice affecting clarity.\nThird Point: Detailed feedback\nand so on..."
        },
        "expectedAnswer": "The expected answer to the question. The answer should be in 50 words."
    }

    Ensure that in the grammarExplanation you do not provide punctuation or capitalization errors as cons because the text is generated by Whisper. The feedback should focus on substantive grammar issues like sentence structure, verb tense, or clarity. 
    Ensure the keys are exactly "question", "userAnswer", "overallScore", "grammarScore", "vocabularyScore", "technicalExplanation", "vocabularyExplanation", and "grammarExplanation". All scores should be integers.
`;

  const completion = await openai.chat.completions.create({
    messages: [{role: "system", content: "You are a strict but constructive interviewer."}, {
      role: "user",
      content: prompt
    }], model: "gpt-4o-mini", max_tokens: 1000,
  });

  //

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}

async function evaluateAnswerForSvar(answer, question, difficulty) {
  console.log("Inside the evaluate answer for svar")
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
  });
  const prompt = `
    You are an interviewer. I will provide you with a question and its answer. Your task is to evaluate the answer on a scale of 0 to 100 and provide a detailed, constructive report covering both the strengths and weaknesses in each of the following areas. Be specific and thorough in your feedback, offering detailed analysis and examples where necessary.

    Here is the question: "${question}"
    Here is the answer: "${answer}"
    Here is the difficulty : "${difficulty}"

    Expected answer logic:
    - If difficulty is "reading" or "repeating", the expected answer is the same as the question.
    - If difficulty is "jumbled", the expected answer is an unjumbled version of the question.
    - If difficulty is "short" or "comprehension", the expected answer is the actual answer to the question.

    Please evaluate the answer based on the following criteria:
    1. Overall Score: An integer score out of 100 for the overall quality of the answer, taking into account all aspects (pronunciation, clarity, grammar, etc.).
    2. Grammar: An integer score out of 100 for the grammatical correctness of the answer. Focus on sentence structure, verb tense, and clarity.
    3. Pronunciation: An integer score out of 100 for the pronunciation of the answer. Evaluate clarity, smoothness, and accuracy of pronunciation.
    4. Correctness: An integer score out of 100 for the factual correctness of the answer. Evaluate the accuracy, depth of knowledge, and relevance of the information provided.
    5. Unjumbled: If the difficulty is "jumbled", provide the unjumbled version of the question as the expected answer.

    The response should be in JSON format and must follow this structure. Do not add any additional information, and ensure the keys are exactly as shown below. Ensure that there are no symbols like tilde so that I can parse it as JSON:
    {
        "question": '${question}',
        "userAnswer": "${answer}",
        "overallScore": 90,
        "grammarScore": 85,
        "pronunciationScore": 88,
        "correctnessScore": 92,
       "pronunciationExplanation": {
            "Pros": "Brief explanation of the strong points of pronunciation.Not more than 10 words.",
            "Cons": "Brief explanation of the weak points in pronunciation and suggestions for improvement.Not more than 10 words."
        },
        "correctnessExplanation": {
            "Pros": "Brief explanation of the strong points of correctness.Not more than 10 words.",
            "Cons": "Brief explanation of the weak points in correctness and suggestions for improvement.Not more than 10 words."
        },
        "grammarExplanation": {
                "Pros": "Brief explanation of the strong points in grammar.Not more than 10 words.",
                "Cons": "Brief explanation of grammatical errors and suggestions for improvement.Not more than 10 words."
            },
        "expectedAnswer": "${difficulty === 'reading' || difficulty === 'repeating' ? question :
    difficulty === 'jumbled' ? 'unjumble(question)' :
      difficulty === 'short' || difficulty === 'comprehension' ? 'expected answer to the question' : ''}"
    }

    Ensure that in the grammarExplanation you do not provide punctuation or capitalization errors as cons because the text is generated by Whisper. The feedback should focus on substantive grammar issues like sentence structure, verb tense, or clarity. Ensure the keys are exactly "question", "userAnswer", "overallScore", "grammarScore", "pronunciationScore", and "correctnessScore". All scores should be integers.
`;

  let tries = 1;
  let completion;
  while (tries > 0) {
    try {
      completion = await openai.chat.completions.create({
        messages: [{role: "system", content: "You are a strict but constructive interviewer."}, {
          role: "user",
          content: prompt
        }], model: "gpt-4o-mini", max_tokens: 1000,
      });

      const json = JSON.parse(completion.choices[0].message.content);

      break;
    } catch (error) {
      console.warn(error);
      tries--;
    }
  }

  if (tries === 0) {
    return {};
  }

  console.log(completion.choices[0].message.content);

  return completion.choices[0].message.content;
}

async function textToSpeech(input, audioPath) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const mp3 = await openai.audio.speech.create({
    model: "tts-1", voice: "onyx", input: input,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(audioPath, buffer);
}


// ---------------------------- Evaluation Functions ----------------------------


export const evaluateAnswer = asyncHandler(async (req, res) => {
  try {
    let {question, interviewId, difficulty, questionNo} = req.body;
    let answer = req.extractedAnswer;


    if (answer === undefined) {
      answer = req.body.answer;
    }
    if (!question) {
      question = await getSessionQuestions(interviewId, questionNo);
    }

    const interview = await Interview.findById(interviewId); //fetch

    interview.attemptedQuestions += 1;
    if (interview.attemptedQuestions === 1) {
      interview.firstAttemptedAt = new Date();
    }
    interview.lastAttemptedAt = new Date();
    await interview.save();


    let feedback;
    if (interview.type === "Svar") {
      console.log("Svar me ghus gaye")
      feedback = await evaluateAnswerForSvar(answer, question, difficulty);
      if (JSON.stringify(feedback) === "{}") {
        return res.status(500).json(ApiError(500, "Failed to evaluate answer"));
      }
    } else {
      feedback = await evaluateAnswerWithPrompt(answer, question);
    }

    console.log("answer ####", answer);
    console.log("question ####", question);
    console.log("interviewId ####", interviewId);

    // let feedback = await evaluateAnswerWithPrompt(answer, question);

    feedback = JSON.parse(feedback);

    if (interview.type === "Svar") {
      console.log("svar ke liye create hone me ghus gaye")
      await InterviewQuestion.create({
        question: question,
        answer: feedback.userAnswer,
        expectedAnswer: feedback.expectedAnswer,
        interview: interviewId,
        student: req.user._id,
        overallPerformance: feedback.overallScore <= 30 ? 0 : feedback.overallScore,
        grammar: feedback.grammarScore,
        pronounciation: feedback.pronunciationScore,
        correctness: feedback.correctnessScore,
        grammarExplanation: [feedback.grammarExplanation.Pros, feedback.grammarExplanation.Cons],
        pronunciationExplanation: [feedback.pronunciationExplanation.Pros, feedback.pronunciationExplanation.Cons],
        correctnessExplanation: [feedback.correctnessExplanation.Pros, feedback.correctnessExplanation.Cons]
      })
    } else {
      await InterviewQuestion.create({
        question: question,
        answer: feedback.userAnswer,
        expectedAnswer: feedback.expectedAnswer,
        interview: interviewId,
        student: req.user._id,
        overallPerformance: feedback.overallScore <= 30 ? 0 : feedback.overallScore,
        grammar: feedback.grammarScore,
        vocabulary: feedback.vocabularyScore,
        technicalExplanation: [feedback.technicalExplanation.Pros, feedback.technicalExplanation.Cons],
        vocabularyExplanation: [feedback.vocabularyExplanation.Pros, feedback.vocabularyExplanation.Cons],
        grammarExplanation: [feedback.grammarExplanation.Pros, feedback.grammarExplanation.Cons],
      });
    }

    if (!interview.evaluatedQuestions)
        interview.evaluatedQuestions = 1;
    else interview.evaluatedQuestions += 1;

    // todo: end interview if all questions are attempted (totalQuestions === attemptedQuestions) but after monitoring it in generate question and frontend

    await interview.save();
    console.log("answer added successfully ####");

    return res.status(200).json(new ApiResponse(200, feedback, "Answer evaluated successfully"));
  } catch (err) {
    console.warn(err);
    return res.status(500).json(ApiError(500, err.message || "Internal Server Error"));
  }
});

export const evaluateAnswerWritten = asyncHandler(async (req, res) => {
  try {

    const {question, answer, interviewId} = req.body;
    console.log("answer ####", answer);
    console.log("question ####", question);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
    });
    const prompt = `
        You are an evaluator. I will provide you with a prompt and the corresponding response written by the user. Your task is to evaluate the response on a scale of 0 to 100 and provide a detailed, constructive report covering both the strengths and weaknesses of the response in each of the following areas.

        Here is the prompt: "${question}"
        Here is the response: "${answer}"

        Please evaluate the response based on the following criteria:

        Overall Score: An integer score out of 100 for the overall quality of the response.
        Grammar: An integer score out of 100 for the grammatical correctness of the response.
        Vocabulary: An integer score out of 100 for the vocabulary used in the response, including spelling accuracy.
        Content and Structure: An integer score out of 100 for the relevance, depth, originality, logical flow, and organization of the response.
        
        The report must be detailed, addressing both strengths and weaknesses in each category. Include suggestions for improvement where relevant. Be specific about what the user has done well and what can be improved, with clear examples if applicable.

        contentStructureExplanation: Detailed feedback on the content, logical flow, and organization of the response. You must address both positive aspects (what was done well) and areas for improvement (what needs to be improved and how).

        vocabularyExplanation: Detailed feedback on the vocabulary used in the response. You must mention the strength of word choices and variety, while also pointing out if certain words could be replaced for better clarity, tone, or precision.

        grammarExplanation: Detailed feedback on the grammatical correctness of the response. You must point out both correct usage and any errors, including sentence structure, punctuation, or verb tense issues, along with suggestions for how to correct them.

        The response should be in JSON format and must follow this structure. Do not add any additional information, and ensure the keys are exactly as shown below. Ensure there are no symbols like tilde so that I can parse it as JSON:
        {
            "prompt": "The prompt",
            "userResponse": "The user's response text",
            "overallScore": 90,
            "grammarScore": 85,
            "vocabularyScore": 88,
            "contentStructureScore": 90,
            "contentStructureExplanation": {
                "Pros": "Detailed explanation of the strong points of the content and structure\nFirst Point: Detailed feedback\nSecond Point: Detailed feedback\nand so on...",
                "Cons": "Detailed explanation of the weak points of the content and structure and suggestions for improvement\nFirst Point: Detailed feedback\nSecond Point: Detailed feedback\nand so on..."
            },
            "vocabularyExplanation": {
                "Pros": "Detailed explanation of the strong points of the vocabulary used\nFirst Point: Detailed feedback\nSecond Point: Detailed feedback\nand so on...",
                "Cons": "Detailed explanation of the weak points of the vocabulary used and suggestions for improvement\nFirst Point: Detailed feedback\nSecond Point: Spelling error(s) detected, specific word(s) with mistakes and their corrections\nand so on..."
            },
            "grammarExplanation": {
                "Pros": "Detailed explanation of the strong points of the grammar used\nFirst Point: Detailed feedback\nSecond Point: Detailed feedback\nand so on...",
                "Cons": "Detailed explanation of the weak points of the grammar used and suggestions for correction\nFirst Point: Detailed feedback\nSecond Point: Detailed feedback\nand so on..."
            },
            "expectedResponse": "The expected response to the prompt. The response should be in 200 words."
        }

        Ensure the keys are exactly "prompt", "userResponse", "overallScore", "grammarScore", "vocabularyScore", "contentStructureScore", "contentStructureExplanation", "vocabularyExplanation", and "grammarExplanation". All scores should be integers.
        If the question is fill-in-the-blank, antonyms, or synonyms, the expected response should be a single word. If the user provides the correct word, all scores should be 100.
`;


    const completion = await openai.chat.completions.create({
      messages: [{role: "system", content: "You are a strict but constructive english professor."}, {
        role: "user",
        content: prompt
      }], model: "gpt-4o-mini", max_tokens: 1000,
    });

    const completionData = JSON.parse(completion.choices[0].message.content);

    await InterviewQuestion.create({
      question: question,
      answer: answer,
      interview: interviewId,
      student: req.user._id,
      overallPerformance: completionData.overallScore <= 30 ? 0 : completionData.overallScore,
      grammar: completionData.grammarScore,
      vocabulary: completionData.vocabularyScore,
      technicalExplanation: [completionData.contentStructureExplanation.Pros, completionData.contentStructureExplanation.Cons],
      vocabularyExplanation: [completionData.vocabularyExplanation.Pros, completionData.vocabularyExplanation.Cons],
      grammarExplanation: [completionData.grammarExplanation.Pros, completionData.grammarExplanation.Cons],
      expectedAnswer: completionData.expectedResponse
    });


    res.status(200).send(completion.choices[0].message.content);
  } catch (err) {
    return res.status(500).json(ApiError(500, err.message || "Internal Server Error"));
  }
});

export const evaluateAnswerSvar = asyncHandler(async (req, res) => {
  try {
    const {question, interviewId} = req.body
    let answer = req.extractedAnswer

    if (answer === undefined) {
      answer = req.body.answer;
    }

    let evaluatePrompt = await evaluateAnswerForSvar(answer, question, difficulty);
    if (JSON.stringify(evaluatePrompt) === "{}") {
      return res.status(500).json(ApiError(500, "Failed to evaluate answer"));
    }

    evaluatePrompt = JSON.parse(evaluatePrompt);

    await InterviewQuestion.create({
      question: question,
      answer: evaluatePrompt.userAnswer,
      expectedAnswer: evaluatePrompt.expectedAnswer,
      interview: interviewId,
      student: req.user._id,
      overallPerformance: evaluatePrompt.overallScore <= 30 ? 0 : feedback.overallScore,
      grammar: evaluatePrompt.grammarScore,
      pronunciation: evaluatePrompt.pronunciationScore,
      pronunciationExplanation: [evaluatePrompt.pronunciationExplanation.Pros, evaluatePrompt.pronunciationExplanation.Cons],
      correctnessExplanation: [evaluatePrompt.correctnessExplanation.Pros, evaluatePrompt.correctnessExplanation.Cons],
      grammarExplanation: [evaluatePrompt.grammarExplanation.Pros, evaluatePrompt.grammarExplanation.Cons],
    });

    console.log("answer added successfully ####");

    return res.status(200).json(new ApiResponse(200, JSON.parse(evaluatePrompt), "Answer evaluated successfully"));
  } catch (err) {
    return res.status(500).json(ApiError(500, err.message || "Internal Server Error"));
  }
});


// ---------------------------- Extra Routes ----------------------------

export const saveResultToDb = asyncHandler(async (req, res) => {
  try {
    const {data, interviewId} = req.body
    console.log("data ####", data);

    const interview = await Interview.findById(interviewId);
    console.log("interview ####", interview);
    interview.is_active = false;
    interview.end_time = new Date();
    await interview.save();

    const currentUser = req.user;
    const student = await Student.findOne({user: currentUser._id});
    console.log("student ####", student);

    // deleting all session questions after interview ends
    // await deleteSessionQuestions(interviewId);


    return res.status(200).json(new ApiResponse(200, {}, "Result saved successfully"));
  } catch (err) {
    console.log(err.message)
    return res.status(500).json(ApiError(500, err.message));
  }
})

export const getInterviewHeld = asyncHandler(async (req, res) => {
  try {
    console.log("req.user ####", req.user);
    const user = req.user;
    const student = await Student.findOne({user: user._id});
    console.log("student ####", student);
    // take only latest 5 interview
    const interview_taken = student?.interview_taken.slice(-7);
    return res.status(200).json(new ApiResponse(200, interview_taken, "Interviews fetched successfully"))
  } catch (error) {
    console.log(error.message);
    return res.status(500).json(ApiError(500, error.message));
  }
})

export const getPartialDetailsByInterviewId = asyncHandler(async (req, res) => {
  try {
    console.log("req.body ####", req.body);
    const interviewId = req.body.interviewId;
    console.log("interviewId ####", interviewId);
    const interview = await Interview.findById(interviewId);
    console.log("interview ####", interview);

    const interviewDetails = {
      id: interview._id,
      title: interview.title,
      description: interview.description,
      end_time: interview.end_time?.toString().split(" ")[4].slice(0, 5)
    }
    return res.status(200).json(new ApiResponse(200, interviewDetails, "Interview details fetched successfully"));
  } catch (error) {
    console.log(error.message);
    return res.status(500).json(ApiError(500, error.message));
  }
})


// ---------------------------- fetch Interviews ----------------------------

// in use
export const fetchAllInterviews = asyncHandler(async (req, res) => {
  /*
   * Fetch all the interviews for the student dashboard
   */
  try {
    // console.log("req.user ####", req.user);

    const student = await Student.findOne({user: req.user._id})
    // console.log("student ####", student);
    if (!student) {
      res.status(404).json(ApiError(404, "Student not found"))
    }

    const interviews = await Interview.find({_id: {$in: student.interview_taken}})

    // console.log(interviews)

    return res.status(200).json(new ApiResponse(200, interviews, "Interviews fetched successfully"))
  } catch (error) {
    console.error(`${new Date().toISOString()} - ${error}`)
    res.status(500).json(ApiError(500, error.message || "Internal Server Error"))
  }
})

export const fetchInterviewForSvar = asyncHandler(async (req, res) => {
  try {
    const {interviewId} = req.body;

    if (!interviewId) {
      return res.status(400).json(ApiError(400, "Interview ID is required"));
    }

    const interview = await Interview.findById(interviewId)
    if (!interview) {
      return res.status(404).json(ApiError(404, "Interview does not exist"));
    }
    return res.status(200).json(new ApiResponse(200, {interview}, "Interview fetched successfully"))
  } catch (err) {
    res.status(500).json(ApiError(500, err.message || "Internal Server Error"));
  }
})

export const interviewQuestionCount = asyncHandler(async (req, res) => {
  try {
    const {interviewId} = req.body;

    if (!interviewId) {
      return res.status(400).json(ApiError(404, "Interview ID not sent"))
    }

    const interview = await getAdminInterview({interview: interviewId});

    if (!interview) {
      return res.status(400).json(ApiError(400, "Interview not found!"));
    }

    const count = interview.no_of_questions;
    const currentQuestion = (await Interview.findById(interviewId)).attemptedQuestions;
    return res.status(200).json(new ApiResponse(200, {count, currentQuestion}, "Interview Fetched Successfully"));
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error" || err.message
    })
  }
})
