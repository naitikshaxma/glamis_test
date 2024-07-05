// import fs from "fs";
// import OpenAI from "openai";

// const openai = new OpenAI();

// async function speechToText(audio) {
//     const transcription = await openai.audio.transcriptions.create({
//         file: fs.createReadStream(audio),
//         model: "whisper-1",
//         response_format: "json",
//         prompt: "input will be in english language only",
//     });

//     return transcription.text
// }

// export default speechToText;

import fs from "fs";
import OpenAI from "openai";
import readlineSync from "readline-sync";
import path from "path";
import "dotenv/config.js";
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const speechFile = path.resolve("./output.mp3");
let conversationHistory = [];

const openai = new OpenAI({
    apiKey: "sk-proj-PsXMWFiMDxKdLZbI101yT3BlbkFJ0qxh9OOVAsT6cOxcugQi",
});

async function generateQuestion(subject) {
    if (conversationHistory.length > 0) {
        const lastInteraction = conversationHistory[conversationHistory.length - 1];
        lastInteraction.answer = '';
    }
    conversationHistory.push({ subject });

    const historyPrompt = conversationHistory.map((interaction, index) => {
        return `Q${index + 1}: ${interaction.subject}\nA${index + 1}: ${interaction.answer || ''}`;
    }).join("\n");

    const prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new question for the subject: "${subject}"`;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 50,
    });

    const question = completion.choices[0].message.content.trim();
    await textToSpeech(question);
    return question;
}

async function evaluateAnswerWithPrompt(answer, question) {
    const prompt = `
    You are an interviewer. I will provide you with a question and its answer.
    I want you to evaluate the answer on a scale of 0 to 100 and give constructive feedback.
    Here is the question: "${question}"
    Here is the answer: "${answer}"
    Your feedback should include a score out of 100 and comments on the strengths and weaknesses of the answer.
    -answer should be in json format.
    -for eg: if my answer is scoring 90/100 and due to any possible reasons so your response should be like :
    - {'score': '90/100', 'explanation':'The answer provided is a repetition of the question rather than a standalone response'}
    -i want only json in the response. 
    -keys must be score and explanation
    -score should be out of 100
    -explanation should be a string
    -format should be like {'score': '90/100', 'explanation':'The answer provided is a repetition of the question rather than a standalone response'}
    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a strict but constructive interviewer." },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 150,
    });

    return JSON.parse(completion.choices[0].message.content);
}

async function startInterview(subject) {
    while (true) {
        const question = await generateQuestion(subject);
        console.log(`Question: ${question}`);

        const answer = readlineSync.question('Your answer: ');
        const feedback = await evaluateAnswerWithPrompt(answer, question);
        console.log(`Feedback: ${JSON.stringify(feedback, null, 2)}`);

        // Store the question and answer in conversation history
        conversationHistory[conversationHistory.length - 1].answer = answer;

        const continueInterview = readlineSync.question('Do you want to continue the interview? (yes/no): ');
        if (continueInterview.toLowerCase() !== 'yes') {
            break;
        }
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

    const fileContent = fs.readFileSync(speechFile);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'output.mp3',
        Body: fileContent
    };

    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
}

const subject = readlineSync.question('Enter the subject for the interview: ');
startInterview(subject);
