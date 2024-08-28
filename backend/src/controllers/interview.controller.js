import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AdminSubjectInterview, AdminWrittenInterview, Interview, InterviewQuestion } from "../models/interview.models.js"
import { Student } from "../models/users.models.js"
import "dotenv/config.js";
import { ApiError } from "../utils/ApiError.js";
import connectRedis from "../db/redis.connect.js"
import generateQuestionsPrompt from "../utils/prompts/generateQuestions.js";
import generateQuestionsPromptForJD from "../utils/prompts/generateQuestionsForJD.js"
import generateQuestionsPromptForWritten from "../utils/prompts/generateQuestionsForWritten.js";
import { AdminCompanyInterview, InterviewQuestionsByAdmin } from "../models/interview.models.js";

const objectStorePath = path.resolve("../objectStore");

export const createInterview = asyncHandler(async (req, res) => {
    try {
        const { subject } = req.body;
        console.log("subject ####", subject);
        const interview = await Interview.create({
            start_time: new Date(),
            is_active: true,
            title: subject,
            description: subject
        })

        console.log("Interview created ####", interview);

        const currentUser = req.user;
        console.log("currentUser ####", currentUser);
        const student = await Student.findOne({ user: currentUser._id });
        console.log("student ####", student);
        student.interview_taken.push(interview._id);
        await student.save();
        try {
            let redisClient = await connectRedis()
            await redisClient.set(String(interview._id), JSON.stringify([]));
            // redisClient.expire(email_id, 600);
        } catch (error) {
            console.log("Error while connecting to Redis", error)
            return res.status(500).json(
                ApiError(500, error.message || "Internal Server Error")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, interview, "Interview created successfully")
        );
    }
    catch (err) {
        return res.status(500).json(
            ApiError(500, err.message || "Internal Server Error")
        );
    }
});

export const createInterviewByJD = asyncHandler(async (req, res) => {
    try {
        const { selectedCompany, jobTitle } = req.body;
        const interview = await Interview.create({
            start_time: new Date(),
            is_active: true,
            title: jobTitle,
            description: selectedCompany + " " + jobTitle,
        });

        console.log("Interview created ####", interview);

        const currentUser = req.user;
        console.log("currentUser ####", currentUser);
        const student = await Student.findOne({ user: currentUser._id });
        console.log("student ####", student);
        student.interview_taken.push(interview._id);
        await student.save();

        try {
            let redisClient = await connectRedis();
            await redisClient.set(String(interview._id), JSON.stringify([]));
        } catch (error) {
            console.log("Error while connecting to Redis", error);
            return res.status(500).json(
                ApiError(500, error.message || "Internal Server Error")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, interview, "Interview created successfully")
        );
    } catch (err) {
        return res.status(500).json(
            ApiError(500, err.message || "Internal Server Error")
        );
    }
});

export const generateQuestion = asyncHandler(async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
    });
    const { subject, answer, score, interviewId } = req.body;

    let redisClient = await connectRedis()

    // Add the current question and answer to the conversation history
    let conversationHistory = JSON.parse(await redisClient.get(interviewId));
    console.log(typeof conversationHistory, ",", conversationHistory, ",", conversationHistory.length)
    if (conversationHistory.length > 0) {
        console.log("conversationHistory ####", conversationHistory);

        conversationHistory.push({
            answer: answer,
            score: score
        })
        console.log("###########", conversationHistory);
    }
    else {
        conversationHistory.push({ subject });
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
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
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
        return res.status(500).json({ error: 'Failed to generate audio' });
    }

    const dataToSend = {
        question,
        audioFileName: audioFileName
    }

    return res.status(200).json(
        new ApiResponse(200, dataToSend, "Question generated successfully")
    );
});

export const generateQuestionForWritten = asyncHandler(async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const { subject, interviewId } = req.body;

    let redisClient = await connectRedis();

    // Add the current question and answer to the conversation history
    let conversationHistory = JSON.parse(await redisClient.get(interviewId));
    if (conversationHistory.length > 0) {
        conversationHistory.push({
            subject
        });
    } else {
        conversationHistory.push({ subject });
    }
    await redisClient.set(interviewId, JSON.stringify(conversationHistory));

    let prompt = generateQuestionsPromptForWritten(subject);

    prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent. Question should be under 100 words.";

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are an English professor." },
            { role: "user", content: prompt }
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
        return res.status(500).json({ error: 'Failed to generate audio' });
    }

    const dataToSend = {
        question,
        audioFileName: audioFileName
    };

    return res.status(200).json(
        new ApiResponse(200, dataToSend, "Question generated successfully")
    );
});

export const generateQuestionForJD = asyncHandler(async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const { selectedCompany, jobTitle, jdDetails, answer, score, interviewId } = req.body; // difficulty

    let redisClient = await connectRedis();

    // Add the current question and answer to the conversation history
    let conversationHistory = JSON.parse(await redisClient.get(interviewId));
    if (conversationHistory.length > 0) {
        conversationHistory.push({
            answer: answer,
            score: score
        });
    } else {
        conversationHistory.push({ selectedCompany, jobTitle, jdDetails });
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
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
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
        return res.status(500).json({ error: 'Failed to generate audio' });
    }

    const dataToSend = {
        question,
        audioFileName: audioFileName
    };

    console.log("Conversation History: ", conversationHistory)
    return res.status(200).json(
        new ApiResponse(200, dataToSend, "Question generated successfully")
    );
});


export const generateQuestionForJDAdmin = asyncHandler(async (req, res) => {
    console.log("entered jd admin")
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { selectedCompany, jobTitle, jdDetails, answer, score, interviewId, questionNo, adminInterviewId } = req.body;
    console.log(req.body);

    let redisClient = await connectRedis();
    let conversationHistory = JSON.parse(await redisClient.get(interviewId));
    console.log("connected redis")

    if (conversationHistory.length > 0) {
        conversationHistory.push({
            answer: answer,
            score: score
        });
    } else {
        conversationHistory.push({ selectedCompany, jobTitle, jdDetails });
    }
    await redisClient.set(interviewId, JSON.stringify(conversationHistory));


    const adminInterview = await AdminCompanyInterview.findById(adminInterviewId);

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
        const easyQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Easy", _id: { $in: adminInterview.questions } });
        if (questionNo < easyQuestions.length) {
            const question = easyQuestions[questionNo].question;
            console.log(question)
            console.log(easyQuestions)

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({ error: 'Failed to generate audio' });
            }

            const dataToSend = {
                question,
                audioFileName: audioFileName
            };

            return res.status(200).json(
                new ApiResponse(200, dataToSend, "Question generated successfully")
            );
        }
    }

    if (difficulty === "Medium") {
        const mediumQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Medium", _id: { $in: adminInterview.questions } });
        console.log("______________________________\n" + mediumQuestions + "\n_______________________________________")
        if (questionNo - adminInterview.easy_remaining < mediumQuestions.length) {
            const question = mediumQuestions[questionNo - adminInterview.easy_remaining].question;

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({ error: 'Failed to generate audio' });
            }

            const dataToSend = {
                question,
                audioFileName: audioFileName
            };

            return res.status(200).json(
                new ApiResponse(200, dataToSend, "Question generated successfully")
            );
        }
    }

    if (difficulty === "Hard") {
        const hardQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Hard", _id: { $in: adminInterview.questions } });
        if (questionNo - (adminInterview.easy_remaining + adminInterview.medium_remaining) < hardQuestions.length) {
            const question = hardQuestions[questionNo - (adminInterview.easy_remaining + adminInterview.medium_remaining)].question;

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({ error: 'Failed to generate audio' });
            }

            const dataToSend = {
                question,
                audioFileName: audioFileName
            };

            return res.status(200).json(
                new ApiResponse(200, dataToSend, "Question generated successfully")
            );
        }
    }

    let prompt = "";
    if (difficulty === "Easy") {
        prompt = `Based on the previous questions and answers, generate a straightforward and generic question related to the job title ${jobTitle} for ${selectedCompany}. The question should be directly related to the job description keywords , they can be related to particular core cs subjects and not involve coding or complex scenarios.\n\n${jdDetails}`
    } else if (difficulty === "Medium") {
        prompt = `Based on the previous questions and answers, generate a new coding question for a ${jobTitle} interview at ${selectedCompany}. Provide a code snippet and ask the user to solve the problem or explain the code:\n\n\`\`\`java\n// Your code snippet here\n\`\`\`\n\nEnsure the question is relevant to the job description and appropriately challenging.`
    } else {
        prompt = `Based on the previous questions and answers, generate a scenario-based question for a ${jobTitle} interview at ${selectedCompany}. The question should involve real-world tasks and challenges directly related to the job description and role.\n\n${jdDetails}`
    }

    prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent. THe length of the question should be less than 100 words.";

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
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
        return res.status(500).json({ error: 'Failed to generate audio' });
    }

    const dataToSend = {
        question,
        audioFileName: audioFileName
    };

    return res.status(200).json(
        new ApiResponse(200, dataToSend, "Question generated successfully")
    );

});

export const generateQuestionForWrittenAdmin = asyncHandler(async (req, res) => {
    console.log("entered written admin")
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { subject, answer, score, interviewId, questionNo, adminInterviewId } = req.body;

    let redisClient = await connectRedis();
    let conversationHistory = JSON.parse(await redisClient.get(interviewId));
    console.log("connected redis")

    if (conversationHistory.length > 0) {
        conversationHistory.push({
            answer: answer,
            score: score
        });
    } else {
        conversationHistory.push({ subject });
    }
    await redisClient.set(interviewId, JSON.stringify(conversationHistory));

    const adminInterview = await AdminWrittenInterview.findById(adminInterviewId);

    if (adminInterview === null) {
        return res.status(404).json(ApiError(404, "Interview not found"));
    }

    console.log('wow')

    let difficulty = '';

    if (adminInterview.essay > questionNo) {
        difficulty = 'Essay';
    } else if (adminInterview.jumbled + adminInterview.essay > questionNo) {
        difficulty = 'Jumbled';
    } else {
        difficulty = 'ErrorDetection';
    }

    // if difficulty is Easy and no of questions are less than easy_remaining then fetch the question from db

    if (difficulty === "Essay") {
        const essayQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Essay", _id: { $in: adminInterview.questions } });
        if (questionNo < essayQuestions.length) {
            const question = essayQuestions[questionNo].question;
            console.log(question)
            console.log(essayQuestions)

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({ error: 'Failed to generate audio' });
            }
        }
    }

    if (difficulty === "Jumbled") {
        const jumbledQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Jumbled", _id: { $in: adminInterview.questions } });
        if (questionNo - adminInterview.essay < jumbledQuestions.length) {
            const question = jumbledQuestions[questionNo - adminInterview.essay].question;

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {

                return res.status(500).json({ error: 'Failed to generate audio' });

            }

            const dataToSend = {
                question,

                audioFileName: audioFileName

            };

            return res.status(200).json(

                new ApiResponse(200, dataToSend, "Question generated successfully")

            );

        }
    }

    if (difficulty === "ErrorDetection") {

        const errorDetectionQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "ErrorDetection", _id: { $in: adminInterview.questions } });

        if (questionNo - (adminInterview.essay + adminInterview.jumbled) < errorDetectionQuestions.length) {

            const question = errorDetectionQuestions[questionNo - (adminInterview.essay + adminInterview.jumbled)].question;

            const audioFileName = `question-${generateUniqueKey()}.mp3`;

            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');

            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {

                return res.status(500).json({ error: 'Failed to generate audio' });

            }
        }
    }

    let prompt = "";

    if (difficulty === "Essay") {

        prompt = `Write an essay on the topic ${subject}. The essay should be at least 200 words long and should be well-structured and coherent. Ensure that the essay is free of grammatical errors and is written in a formal tone.`

    } else if (difficulty === "Jumbled") {

        prompt = `Based on the previous questions and answers, generate a jumbled sentence. The sentence should be related to the topic and should be challenging to unscramble. Provide the user with a hint to help them unscramble the sentence.`

    } else {

        prompt = `Based on the previous questions and answers, generate a sentence with an error. The sentence should be related to the topic and should contain a grammatical or spelling error. Provide the user with a hint to help them identify and correct the error.`
    }

    prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent.";

    const completion = await openai.chat.completions.create({

        messages: [

            { role: "system", content: "You are an English professor." },

            { role: "user", content: prompt }

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

        return res.status(500).json({ error: 'Failed to generate audio' });

    }

    const dataToSend = {

        question,

        audioFileName: audioFileName


    };

    return res.status(200).json(

        new ApiResponse(200, dataToSend, "Question generated successfully")

    );
});


export const generateQuestionForSubjectAdmin = asyncHandler(async (req, res) => {
    console.log("entered subject admin")
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { subject, answer, score, interviewId, questionNo, adminInterviewId } = req.body;
    console.log(req.body);

    let redisClient = await connectRedis();
    let conversationHistory = JSON.parse(await redisClient.get(interviewId));
    console.log("connected redis")

    if (conversationHistory.length > 0) {
        conversationHistory.push({
            answer: answer,
            score: score
        });
    } else {
        conversationHistory.push({ subject });
    }
    await redisClient.set(interviewId, JSON.stringify(conversationHistory));


    const adminInterview = await AdminSubjectInterview.findById(adminInterviewId);

    if (adminInterview === null) {
        return res.status(404).json(ApiError(404, "Interview not found"));
    }


    console.log('wow')
    let difficulty = '';
    if (adminInterview.easy > questionNo) {
        difficulty = 'Easy';
    } else if (adminInterview.medium + adminInterview.easy > questionNo) {
        difficulty = 'Medium';
    } else {
        difficulty = 'Hard';
    }

    // if difficulty is Easy and no of questions are less than easy_remaining then fetch the question from db 

    if (difficulty === "Easy") {
        const easyQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Easy", _id: { $in: adminInterview.questions } });
        if (questionNo < easyQuestions.length) {
            const question = easyQuestions[questionNo].question;
            console.log(question)
            console.log(easyQuestions)

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({ error: 'Failed to generate audio' });
            }

            const dataToSend = {
                question,
                audioFileName: audioFileName
            };

            return res.status(200).json(
                new ApiResponse(200, dataToSend, "Question generated successfully")
            );
        }
    }

    if (difficulty === "Medium") {
        const mediumQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Medium", _id: { $in: adminInterview.questions } });
        console.log("______________________________\n" + mediumQuestions + "\n_______________________________________")
        if (questionNo - adminInterview.easy < mediumQuestions.length) {
            const question = mediumQuestions[questionNo - adminInterview.easy].question;

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({ error: 'Failed to generate audio' });
            }

            const dataToSend = {
                question,
                audioFileName: audioFileName
            };

            return res.status(200).json(
                new ApiResponse(200, dataToSend, "Question generated successfully")
            );
        }
    }

    if (difficulty === "Hard") {
        const hardQuestions = await InterviewQuestionsByAdmin.find({ difficulty: "Hard", _id: { $in: adminInterview.questions } });
        if (questionNo - (adminInterview.easy + adminInterview.medium) < hardQuestions.length) {
            const question = hardQuestions[questionNo - (adminInterview.easy + adminInterview.medium)].question;

            const audioFileName = `question-${generateUniqueKey()}.mp3`;
            const audioFilePath = path.join(objectStorePath, audioFileName);

            const cleanedQuestion = question.replace(/```[\s\S]*?```/g, '');
            await textToSpeech(cleanedQuestion, audioFilePath);

            if (!fs.existsSync(audioFilePath)) {
                return res.status(500).json({ error: 'Failed to generate audio' });
            }

            const dataToSend = {
                question,
                audioFileName: audioFileName
            };

            return res.status(200).json(
                new ApiResponse(200, dataToSend, "Question generated successfully")
            );
        }
    }

    let prompt = "";
    if (difficulty === "Easy") {
        prompt = `Based on the previous questions and answers, generate a straightforward and generic question related to ${subject}. It should be a conceptual question.`
    } else if (difficulty === "Medium") {
        prompt = `Based on the previous questions and answers, generate a new coding question for ${subject} in the appropriate programming language. Provide a code snippet and ask the user to solve the problem or explain the code:\n\n\`\`\`java\n// Your code snippet here\n\`\`\`\n\nEnsure the question is relevant to the job description and appropriately challenging.`
    } else {
        prompt = `Based on the previous questions and answers, generate a scenario-based question for ${subject}. The question should involve real-world tasks and challenges directly related to the jsubject in hand.`
    }

    prompt += "It is important that you do not send the answer to the question too. I just want the question. Only the question text should be sent. THe length of the question should be less than 100 words.";

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
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
        return res.status(500).json({ error: 'Failed to generate audio' });
    }

    const dataToSend = {
        question,
        audioFileName: audioFileName
    };

    return res.status(200).json(
        new ApiResponse(200, dataToSend, "Question generated successfully")
    );

});


const generateUniqueKey = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function evaluateAnswerWithPrompt(answer, question) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
    });
    const prompt = `
        You are an interviewer. I will provide you with a question and its answer. Your task is to evaluate the answer on a scale of 0 to 100 and provide constructive feedback.

        Here is the question: "${question}"
        Here is the answer: "${answer}"

        Please evaluate the answer based on the following criteria:
        1. Overall Score: An integer score out of 100 for the overall quality of the answer.
        2. Grammar: An integer score out of 100 for the grammatical correctness of the answer.
        3. Vocabulary: An integer score out of 100 for the vocabulary used in the answer.
        4. technicalExplanation: Feedback on the technical aspects of the answer.
        5. vocabularyExplanation: Feedback on the vocabulary used in the answer.
        6. grammarExplanation: Feedback on the grammatical correctness of the answer.

        The response should be in JSON format and must follow this structure. Do not add any additional informational and ensure the keys are exactly as shown below, also ensure there are no symbols like tilde are added so that i can parse it as JSON:
        {
            "question": "The question text",
            "userAnswer": "The user's answer text",
            "overallScore": 90,
            "vocabularyScore": 88,
            "grammarScore": 85,
            "technicalExplanation": {
                "Pros": "In the context of a standard answer to this question, explain the strong points of the answer and suggest in points how it can be improved
                        First Point\n
                        Second Point\n
                        and so on...\n
                        Each point should have a max word limit of 10",
                "Cons": "In the context of a standard answer to this question, explain the weak points of the answer and suggest in points how it can be improved
                        First Point\n
                        Second Point\n
                        and so on...\n
                        Each point should have a max word limit of 10"
            },
            "vocabularyExplanation": {
                "Pros": "Explain the strong points of the vocabulary used
                        First Point\n
                        Second Point\n
                        and so on...\n
                        Each point should have a max word limit of 10",
                "Cons": "Explain the weak points of the vocabulary used
                        First Point\n
                        Second Point\n
                        and so on...\n
                        Each point should have a max word limit of 10"
            },
            "grammarExplanation": {
                "Pros": "Explain the strong points of the grammar used
                        First Point\n
                        Second Point\n
                        and so on...\n
                        Each point should have a max word limit of 10",
                "Cons": "Explain the weak points of the grammar used and also suggest the corrections that can be made
                        First Point\n
                        Second Point\n
                        and so on...\n
                        Each point should have a max word limit of 10"
            },
            "expectedAnswer": "The expected answer to the question. The answer should be in 50 words."
        }

        Ensure the keys are exactly "question", "userAnswer", "overallScore", "grammarScore", "vocabularyScore", "technicalExplanation", "vocabularyExplanation" and "grammarExplanation". All scores should be integers.

    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a strict but constructive interviewer." },
            { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini",
        max_tokens: 1000,
    });

    //  

    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content;
}

async function textToSpeech(input, audioPath) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: input,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(audioPath, buffer);
}

export const evaluateAnswer = asyncHandler(async (req, res) => {
    try {
        const { question, interviewId } = req.body;
        let answer = req.extractedAnswer;

        if (answer === undefined) {
            answer = req.body.answer;
        }

        console.log("answer ####", answer);
        console.log("question ####", question);
        console.log("interviewId ####", interviewId);

        let feedback = await evaluateAnswerWithPrompt(answer, question);

        feedback = JSON.parse(feedback);

        console.log("feedback ####", feedback);

        console.log(typeof feedback);

        const interviewQuestion = await InterviewQuestion.create({
            question: question,
            answer: feedback.userAnswer,
            expectedAnswer: feedback.expectedAnswer,
            interview: interviewId,
            student: req.user._id,
            overallPerformance: feedback.overallScore,
            grammar: feedback.grammarScore,
            vocabulary: feedback.vocabularyScore,
            technicalExplanation: [feedback.technicalExplanation.Pros, feedback.technicalExplanation.Cons],
            vocabularyExplanation: [feedback.vocabularyExplanation.Pros, feedback.vocabularyExplanation.Cons],
            grammarExplanation: [feedback.grammarExplanation.Pros, feedback.grammarExplanation.Cons],
        });

        console.log("answer added successfully ####");

        return res.status(200).json(
            new ApiResponse(200, JSON.parse(feedback), "Answer evaluated successfully")
        );
    }
    catch (err) {
        return res.status(500).json(
            ApiError(500, err.message || "Internal Server Error")
        );
    }
});

export const evaluateAnswerWritten = asyncHandler(async (req, res) => {
    const { question, answer, interviewId } = req.body;
    console.log("answer ####", answer);
    console.log("question ####", question);

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
    });
    const prompt = `
    You are an essay evaluator. I will provide you with an essay prompt and the corresponding essay written by the user. Your task is to evaluate the essay on a scale of 0 to 100 and provide detailed, constructive feedback.

    Here is the essay prompt: "${question}"
    Here is the essay: "${answer}"

    Please evaluate the essay based on the following criteria:

    Overall Score: An integer score out of 100 for the overall quality of the essay.
    Grammar: An integer score out of 100 for the grammatical correctness of the essay.
    Vocabulary: An integer score out of 100 for the vocabulary used in the essay.
    Content: An integer score out of 100 for the relevance, depth, and originality of the content.
    Structure: An integer score out of 100 for the logical flow and organization of the essay.
    contentExplanation: Feedback on the content of the essay.
    vocabularyExplanation: Feedback on the vocabulary used in the essay.
    grammarExplanation: Feedback on the grammatical correctness of the essay.
    structureExplanation: Feedback on the structure and organization of the essay.
    The response should be in JSON format and must follow this structure. Do not add any additional information, and ensure the keys are exactly as shown below. Ensure there are no symbols like tilde so that I can parse it as JSON:
    {
        "prompt": "The essay prompt",
        "userEssay": "The user's essay text",
        "overallScore": 90,
        "grammarScore": 85,
        "vocabularyScore": 88,
        "contentScore": 92,
        "structureScore": 87,
        "contentExplanation": {
            "Pros": "Explain the strong points of the content\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10",
            "Cons": "Explain the weak points of the content and suggest improvements\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10"
        },
        "vocabularyExplanation": {
            "Pros": "Explain the strong points of the vocabulary used\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10",
            "Cons": "Explain the weak points of the vocabulary used\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10"
        },
        "grammarExplanation": {
            "Pros": "Explain the strong points of the grammar used\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10",
            "Cons": "Explain the weak points of the grammar used and suggest corrections\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10"
        },
        "structureExplanation": {
            "Pros": "Explain the strong points of the structure used\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10",
            "Cons": "Explain the weak points of the structure used and suggest improvements\nFirst Point\nSecond Point\nand so on...\nEach point should have a max word limit of 10"
        },
        "expectedEssay": "The expected essay response to the prompt. The essay should be in 200 words."
    }

    Ensure the keys are exactly "prompt", "userEssay", "overallScore", "grammarScore", "vocabularyScore", "contentScore", "structureScore", "contentExplanation", "vocabularyExplanation", "grammarExplanation", and "structureExplanation". All scores should be integers.

    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a strict but constructive english professor." },
            { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini",
        max_tokens: 1000,
    });

    //  

    console.log("__________________________________________________\n\n" + completion.choices[0].message.content + "\n\n__________________________________________________");
    return completion.choices[0].message.content;
});


export const saveResultToDb = asyncHandler(async (req, res) => {
    try {
        const { data, interviewId } = req.body
        console.log("data ####", data);

        const interview = await Interview.findById(interviewId);
        console.log("interview ####", interview);
        interview.is_active = false;
        interview.end_time = new Date();
        await interview.save();

        const currentUser = req.user;
        const student = await Student.findOne({ user: currentUser._id });
        console.log("student ####", student);


        return res.status(200).json(
            new ApiResponse(200, {}, "Result saved successfully")
        );
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json(
            ApiError(500, err.message)
        );
    }
})

export const getInterviewHeld = asyncHandler(async (req, res) => {
    try {
        console.log("req.user ####", req.user);
        const user = req.user;
        const student = await Student.findOne({ user: user._id });
        console.log("student ####", student);
        // take only latest 5 interview
        const interview_taken = student?.interview_taken.slice(-5);
        return res.status(200).json(
            new ApiResponse(200, interview_taken, "Interviews fetched successfully")
        )
    } catch (error) {
        console.log(error.message);
        return res.status(500).json(
            ApiError(500, error.message)
        );
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
        return res.status(200).json(
            new ApiResponse(200, interviewDetails, "Interview details fetched successfully")
        );
    } catch (error) {
        console.log(error.message);
        return res.status(500).json(
            ApiError(500, error.message)
        );
    }
})

export const fetchAllInterviews = asyncHandler(async (req, res) => {
    try {
        console.log("req.user ####", req.user);

        const student = await Student.findOne({ user: req.user._id })
        console.log("student ####", student);
        if (!student) {
            res.status(404).json(ApiError(404, "Student not found"))
        }

        const interviews = await Interview.find({ _id: { $in: student.interview_taken } })

        console.log(interviews)

        res.status(200).json(new ApiResponse(200, interviews, "Interviews fetched successfully"))
    } catch (error) {
        res.status(500).json(ApiError(500, error.message || "Internal Server Error"))
    }
})

export const createInterviewByJDAdmin = asyncHandler(async (req, res) => {

    try {
        const { interviewId } = req.body;
        let redisClient = await connectRedis();
        await redisClient.set(String(interviewId), JSON.stringify([]));
        return res.status(200).json(
            new ApiResponse(200, {}, "Interview created successfully")
        );
    } catch (error) {
        console.log("Error while connecting to Redis", error);
        return res.status(500).json(
            ApiError(500, error.message || "Internal Server Error")
        );
    }

})

export const createInterviewByWrittenAdmin = asyncHandler(async (req, res) => {
    try {
        const { interviewId } = req.body;
        const interview = await Interview.findById(interviewId);

        if (interview === null) {
            return res.status(404).json(ApiError(404, "Interview not found"));
        }

        let redisClient = await connectRedis();

        await redisClient.set(String(interviewId), JSON.stringify([]));

        return res.status(200).json(
            new ApiResponse(200, {}, "Interview created successfully")
        );
    } catch (error) {
        console.log("Error while connecting to Redis", error);
        return res.status(500).json(
            ApiError(500, error.message || "Internal Server Error")
        );
    }
})



