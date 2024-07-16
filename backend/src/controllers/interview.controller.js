import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  { Interview, InterviewQuestion, InterviewResult } from "../models/interview.models.js"
import { Student } from "../models/users.models.js"
import "dotenv/config.js";
import { ApiError } from "../utils/ApiError.js";

const objectStorePath = path.resolve("../objectStore");

// Store conversation history in memory
let conversationHistory = [];

export const createInterview = asyncHandler(async (req, res) => {
    try{
        console.log("enter ####");
        const { subject } = req.body;
        console.log("subject ####", subject);
        const interview = await Interview.create({
            start_time : new Date(),
            is_active : true,
            title : subject,
            description : subject
        })

        console.log("Interview created ####", interview);
    
        const currentUser = req.user;
        console.log("currentUser ####", currentUser);
        const student = await Student.findOne({user : currentUser._id});
        console.log("student ####", student);
        student.interview_taken.push(interview._id);
        await student.save();
    
        return res.status(200).json(
            new ApiResponse(200, interview, "Interview created successfully")
        );
    }
    catch(err){
        return res.status(500).json(
            ApiError(500, err.message || "Internal Server Error")
        );
    }
})

export const generateQuestion = asyncHandler(async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
    });
    const { subject, answer, score } = req.body;

    // Add the current question and answer to the conversation history
    if (conversationHistory.length > 0) {
        const lastInteraction = conversationHistory[conversationHistory.length - 1];
        lastInteraction.answer = answer;
        lastInteraction.score = score;
    }
    conversationHistory.push({ subject });

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

    let prompt = null;

    if(conversationHistory.length<3){
         prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} question for the subject: "${subject}"`;
    }
    else{
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for the subject: "${subject}"`;
    }

    

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 1000,
    });

    const question = completion.choices[0].message.content.trim();

    const audioFileName = `question-${generateUniqueKey()}.mp3`;
    const audioFilePath = path.join(objectStorePath, audioFileName);

    await textToSpeech(question, audioFilePath);

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

        The response should be in JSON format and must follow this structure:
        {
            "question": "The question text",
            "userAnswer": "The user's answer text",
            "overallScore": 90,
            "grammarScore": 85,
            "vocabularyScore": 88,
            "technicalExplanation": "Feedback on the technical aspects of the answer",
            "vocabularyExplanation": "Feedback on the vocabulary used in the answer",
            "grammarExplanation": "Feedback on the grammatical correctness of the answer"
        }

        Ensure the keys are exactly "question", "userAnswer", "overallScore", "grammarScore", "vocabularyScore", "technicalExplanation", "vocabularyExplanation" and "grammarExplanation". All scores should be integers.

    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a strict but constructive interviewer." },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
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
        voice: "nova",
        input: input,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(audioPath, buffer);
}

export const evaluateAnswer = asyncHandler(async (req, res) => {
    try{
        const { question } = req.body;
        const answer = req.extractedAnswer;
    
        const feedback = await evaluateAnswerWithPrompt(answer, question);
    
        return res.status(200).json(
            new ApiResponse(200, JSON.parse(feedback), "Answer evaluated successfully")
        );
    }
    catch(err){
        return res.status(500).json(
            ApiError(500, err.message || "Internal Server Error")
        );
    }
});

export const saveResultToDb = asyncHandler(async (req, res) => {
    try{
        const { data, interviewId } = req.body
        console .log("data ####", data);
    
        const interview = await Interview.findById(interviewId);
        console.log("interview ####", interview);
        interview.is_active = false;
        interview.end_time = new Date();
        await interview.save();
    
        const currentUser = req.user;
        const student = await Student.findOne({user : currentUser._id});
        console.log("student ####", student);
    
        for (let i = 0; i < data.length; i++) {
            const question = data[i];
            const interviewQuestion = await InterviewQuestion.create({
                question: question.question,
                answer: question.userAnswer,
                interview: interviewId,
                student: student._id,
            });

            console.log("interviewQuestion ####", interviewQuestion);

            const interviewResult = await InterviewResult.create({
                overallPerformance: question.overallScore,
                grammar: question.grammarScore,
                vocabulary: question.vocabularyScore,
                technicalExplanation: question.technicalExplanation,
                vocabularyExplanation: question.vocabularyExplanation,
                grammarExplanation: question.grammarExplanation,
                student: student._id,
                interview: interviewId,
            });

            console.log("interviewResult ####", interviewResult);
        }
    
        return res.status(200).json(
            new ApiResponse(200, {}, "Result saved successfully")
        );
    }
    catch(err){
        console.log(err.message)
        return res.status(500).json(
            ApiError(500, err.message)
        );
    }
})