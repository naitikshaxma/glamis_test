import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import "dotenv/config.js";

const objectStorePath = path.resolve("../objectStore");

// Store conversation history in memory
let conversationHistory = [];

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

    const prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for the subject: "${subject}"`;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 256,
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
        1. Overall Score: A score out of 100 for the overall quality of the answer.
        2. Grammar: A score out of 100 for the grammatical correctness of the answer.
        3. Vocabulary: A score out of 100 for the vocabulary used in the answer.
        4. Explanation: Constructive feedback highlighting the strengths and weaknesses of the answer.

        The response should be in JSON format and must follow this structure:
        {
            "question": "The question text",
            "userAnswer": "The user's answer text",
            "overallScore": "number out of 100",
            "grammarScore": "number out of 100",
            "vocabularyScore": "number out of 100",
            "explanation": "Detailed feedback on the strengths and weaknesses of the answer"
        }

        Ensure the keys are exactly "question", "userAnswer", "overallScore", "grammarScore", "vocabularyScore", and "explanation".

    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a strict but constructive interviewer." },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 256,
    });

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
    const { question } = req.body;
    const answer = req.extractedAnswer;

    const feedback = await evaluateAnswerWithPrompt(answer, question);

    return res.status(200).json(
        new ApiResponse(200, JSON.parse(feedback), "Answer evaluated successfully")
    );
});
