import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Interview, InterviewQuestion } from "../models/interview.models.js"
import { Student } from "../models/users.models.js"
import "dotenv/config.js";
import { ApiError } from "../utils/ApiError.js";
import connectRedis from "../db/redis.connect.js"
import generateQuestionsPrompt from "../utils/prompts/generateQuestions.js";

const objectStorePath = path.resolve("../objectStore");

// let redisClient;
// const connectToRedisCall = async () => {
//     try {
//         redisClient = await connectRedis()
//     } catch (error) {
//         console.log("Error while connecting to Redis", error)
//     }
// }

// connectToRedisCall();

// Store conversation history in memory
// let conversationHistory = [];

export const createInterview = asyncHandler(async (req, res) => {
    try {
        console.log("enter ####");
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
})

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
    let difficulty = "medium";
    if (score >= 70) {
        difficulty = "hard";
    } else if (score < 40) {
        difficulty = "easy";
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
            "grammarScore": 85,
            "vocabularyScore": 88,
            "technicalExplanation": {
                "Pros": "In the context of a standard answer to this question, explain the strong points of the answer and suggest in points how it can be improved",
                "Cons": "In the context of a standard answer to this question, explain the weak points of the answer and suggest in points how it can be improved"
            },
            "vocabularyExplanation": {
                "Pros": "Explain the strong points of the vocabulary used",
                "Cons": "Explain the weak points of the vocabulary used"
            },
            "grammarExplanation": {
                "Pros": "Explain the strong points of the grammar used",
                "Cons": "Explain the weak points of the grammar used"
            }
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
        const { question } = req.body;
        const answer = req.extractedAnswer;

        const feedback = await evaluateAnswerWithPrompt(answer, question);

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

        for (let i = 0; i < data.length; i++) {
            const question = data[i];
            const interviewQuestion = await InterviewQuestion.create({
                question: question.question,
                answer: question.userAnswer,
                interview: interviewId,
                student: student._id,
                overallPerformance: question.overallScore,
                grammar: question.grammarScore,
                vocabulary: question.vocabularyScore,
                technicalExplanation: [question.technicalExplanation.Pros, question.technicalExplanation.Cons],
                vocabularyExplanation: [question.vocabularyExplanation.Pros, question.vocabularyExplanation.Cons],
                grammarExplanation: [question.grammarExplanation.Pros, question.grammarExplanation.Cons]
            });

        }

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