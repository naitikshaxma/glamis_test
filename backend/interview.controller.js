const OpenAI = require("openai");
const readlineSync = require("readline-sync");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure you have your API key set up in your environment variables
});

/**
 * Generate questions on a particular subject using OpenAI API
 * @param {string} subject - The subject to generate questions about
 */
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
        return questions;

    } catch (error) {
        console.error("Error generating questions:", error);
        return [];
    }
}

/**
 * Evaluate the user's answer
 * @param {string} answer - The user's answer
 * @param {string} question - The question that was asked
 */
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

/**
 * Main function to handle the interview process
 * @param {string} subject - The subject of the interview
 */
async function startInterview(subject) {
    const questions = await generateQuestions(subject);
    for (const question of questions) {
        console.log(`Question: ${question}`);

        const answer = readlineSync.question('Your answer: ');

        const feedback = await evaluateAnswer(answer, question);
        console.log(`Feedback: ${feedback}`);
    }

    console.log('Interview complete!');
}

// Example usage:
const subject = readlineSync.question('Enter the subject for the interview: ');
startInterview(subject);