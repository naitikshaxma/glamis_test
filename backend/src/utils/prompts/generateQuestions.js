let prompt = null;
let subjectType = ""; // This should be set based on the subject passed in req.body or otherwise identified

if (subjectType === "DSA") {
    if (conversationHistory.length < 3) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} generic question for DSA`;
    } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, provide user with a appropriately difficult code snippet. Ask the user to explain the code and predict the output:\n\n\`\`\`java\n# Your java code snippet here\n\`\`\``;
    } else {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for DSA`;
    }
}
else if (subjectType === "Computer Networks") {
    if (conversationHistory.length < 3) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} basic conceptual question for Computer Networks`;
    } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} advanced formula-based question for Computer Networks`;
    } else {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Computer Networks`;
    }
} else if (subjectType === "DBMS") {
    if (conversationHistory.length < 3) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} generic question for DBMS`;
    } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} SQL query question for DBMS`;
    } else {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for DBMS`;
    }
} else if (subjectType === "OS") {
    if (conversationHistory.length < 3) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} generic question for Operating Systems`;
    } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} conceptual question (e.g., round robin, semaphores) for Operating Systems`;
    } else {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Operating Systems`;
    }
} else if (subjectType === "Machine Learning") {
    if (conversationHistory.length < 3) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Machine Learning`;
    } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} output-based question for Machine Learning`;
    } else {
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Machine Learning`;
    }
}

// Handle prompt generation failure
if (!prompt) {
    return res.status(400).json({ error: 'Failed to generate prompt for the specified subject' });
}

// Continue with OpenAI completion request
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
