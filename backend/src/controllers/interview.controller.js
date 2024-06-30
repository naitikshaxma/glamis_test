import fs from "fs";
import OpenAI from "openai";
import readlineSync from "readline-sync";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { generateQuestionPrompt } from "../utils/prompts/prompt.js";

const speechFile = path.resolve("./output.mp3");

export const generateQuestion = asyncHandler(async (req, res) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
    });
    const { subject, answer } = req.body;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: generateQuestionPrompt(subject, answer)}
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 50,
    });

    const question = completion.choices[0].message.content.trim();

    console.log(`Question: ${question}`);

    return res.status(201).json(
        new ApiResponse(200, {question}, "Question generated successfully")
    )
})

async function evaluateAnswer(answer, question) {
    const prompt = `
    You are an interviewer. I will provide you with a question and its answer.
    I want you to evaluate the answer on a scale of 0 to 100 and give constructive feedback.
    Here is the question: "${question}"
    Here is the answer: "${answer}"
    Your feedback should include a score out of 100 and comments on the strengths and weaknesses of the answer.
    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a strict but constructive interviewer." },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 150,
    });

    return completion.choices[0].message.content;
}

async function startInterview(subject) {
    const questions = await generateQuestions(subject);
    for (const question of questions) {
        textToSpeech(question);
        console.log(`Question: ${question}`);

        const answer = readlineSync.question('Your answer: ');

        const feedback = await evaluateAnswer(answer, question);
        console.log(`Feedback: ${feedback}`);
    }

    console.log('Interview complete!');
}

async function textToSpeech(input) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: input,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
}

// const subject = readlineSync.question('Enter the subject for the interview: ');
// startInterview(subject);



export const evaluateAnswer = asyncHandler(async (req, res) => {
    const { question } = req.body;

    const {speechFile} = req.file;

    const answer = await speechToText(speechFile);

    const feedback = await evaluateAnswer(answer, question);

    return res.status(200).json(
        new ApiResponse(200, {feedback}, "Answer evaluated successfully")
    )
})