import fs from "fs";
import OpenAI from "openai";
import readlineSync from "readline-sync";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
});

const speechFile = path.resolve("./output.mp3");

async function generateQuestions(subject) {
    try {
        const prompt = `Generate a list of questions about the following subject: ${subject}`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo",
            max_tokens: 150,
        });

        const questions = completion.choices[0].message.content.split('\n').filter(line => line.trim() !== '').map(line => line.trim());

        return res.status(201).json(
            new ApiResponse(200, questions, "Question Generated Successfully")
        )

    } catch (error) {
        return res.status(500).json(ApiError(500, error.message));
    }
}

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

const subject = readlineSync.question('Enter the subject for the interview: ');
startInterview(subject);