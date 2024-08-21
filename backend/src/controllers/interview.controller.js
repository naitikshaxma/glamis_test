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
import generateQuestionsPromptForJD from "../utils/prompts/generateQuestionsForJD.js"
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
    let difficulty = "medium";
    if (score >= 70) {
        difficulty = "hard";
    } else if (score < 40) {
        difficulty = "easy";
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
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { selectedCompany, jobTitle, jdDetails, answer, score, interviewId, difficulty , questionNo , adminInterviewId} = req.body;

    let redisClient = await connectRedis();
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


    const adminInterview = await AdminCompanyInterview.findById(adminInterviewId);

    if (adminInterview === null) {
        return res.status(404).json(ApiError(404, "Interview not found"));
    }

    // if difficulty is easy and no of questions are less than easy_remaining then fetch the question from db 

    if(difficulty === "easy"){
        const easyQuestions = await InterviewQuestionsByAdmin.find({difficulty: "easy", _id: {$in: adminInterview.questions}});
        if(easyQuestions.length - adminInterview.easy_remaining + questionNo >=0){
            const question = easyQuestions[adminInterview.easy_remaining + questionNo - 1].question;

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

    if(difficulty === "medium"){
        const mediumQuestions = await InterviewQuestionsByAdmin.find({difficulty: "medium", _id: {$in: adminInterview.questions}});
        if(mediumQuestions.length - adminInterview.medium_remaining + questionNo >=0){
            const question = mediumQuestions[adminInterview.medium_remaining + questionNo - 1].question;

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

    if(difficulty === "hard"){
        const hardQuestions = await InterviewQuestionsByAdmin.find({difficulty: "hard", _id: {$in: adminInterview.questions}});
        if(hardQuestions.length - adminInterview.hard_remaining + questionNo >=0){
            const question = hardQuestions[adminInterview.hard_remaining + questionNo - 1].question;

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
    if (difficulty === "easy") {
        prompt = `You are a hiring manager at ${selectedCompany}. You are looking to hire a ${jobTitle}. You have provided the following job description to the candidates: ${jdDetails}. Based on the job description, generate a conceptual question (technical based) that can be asked to the candidates.`
    } else if (difficulty === "medium") {
        prompt = `You are a hiring manager at ${selectedCompany}. You are looking to hire a ${jobTitle}. You have provided the following job description to the candidates: ${jdDetails}. Based on the job description, generate a technical output based/ numerical based  question that can be asked to the candidates.`
    } else {
        prompt = `You are a hiring manager at ${selectedCompany}. You are looking to hire a ${jobTitle}. You have provided the following job description to the candidates: ${jdDetails}. Based on the job description, generate a challenging scenario based question that can be asked to the candidates.`
    }

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
        const answer = req.extractedAnswer;

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

    try{
        const { intervewId } = req.body;
            let redisClient = await connectRedis();
            await redisClient.set(String(intervewId), JSON.stringify([]));
        
        } catch (error) {
            console.log("Error while connecting to Redis", error);
            return res.status(500).json(
                ApiError(500, error.message || "Internal Server Error")
            );
        }
    })



    