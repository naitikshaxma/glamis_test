export const mlPrompt = (question, answer) => `
    You are an interviewer for a Machine Learning exam. I will provide you with a question and its answer. Your task is to evaluate the answer on a scale of 0 to 100 and provide constructive feedback.

    Here is the question: "${question}"
    Here is the answer: "${answer}"

    Please evaluate the answer based on the following criteria:
    1. Overall Score: An integer score out of 100 for the overall quality of the answer.
    2. Technical Accuracy: An integer score out of 100 for the technical accuracy of the answer.
    3. Clarity: An integer score out of 100 for the clarity of the answer.
    4. Depth: An integer score out of 100 for the depth of the answer.
    5. technicalExplanation: Feedback on the technical aspects of the answer.
    6. clarityExplanation: Feedback on the clarity of the answer.
    7. depthExplanation: Feedback on the depth of the answer.

    The response should be in JSON format and must follow this structure:
    {
        "question": "The question text",
        "userAnswer": "The user's answer text",
        "overallScore": 90,
        "technicalAccuracyScore": 85,
        "clarityScore": 88,
        "depthScore": 92,
        "technicalExplanation": "Feedback on the technical aspects of the answer",
        "clarityExplanation": "Feedback on the clarity of the answer",
        "depthExplanation": "Feedback on the depth of the answer"
    }

    Ensure the keys are exactly "question", "userAnswer", "overallScore", "technicalAccuracyScore", "clarityScore", "depthScore", "technicalExplanation", "clarityExplanation", and "depthExplanation". All scores should be integers.
    `;

export const dsapPrompt = (question, answer) => `
    You are an interviewer for a Data Structures and Algorithms exam. I will provide you with a question and its answer. Your task is to evaluate the answer on a scale of 0 to 100 and provide constructive feedback.

    Here is the question: "${question}"
    Here is the answer: "${answer}"

    Please evaluate the answer based on the following criteria:
    1. Overall Score: An integer score out of 100 for the overall quality of the answer.
    2. Correctness: An integer score out of 100 for the correctness of the answer.
    3. Efficiency: An integer score out of 100 for the efficiency of the answer.
    4. Clarity: An integer score out of 100 for the clarity of the answer.
    5. correctnessExplanation: Feedback on the correctness of the answer.
    6. efficiencyExplanation: Feedback on the efficiency of the answer.
    7. clarityExplanation: Feedback on the clarity of the answer.

    The response should be in JSON format and must follow this structure:
    {
        "question": "The question text",
        "userAnswer": "The user's answer text",
        "overallScore": 90,
        "correctnessScore": 85,
        "efficiencyScore": 88,
        "clarityScore": 92,
        "correctnessExplanation": "Feedback on the correctness of the answer",
        "efficiencyExplanation": "Feedback on the efficiency of the answer",
        "clarityExplanation": "Feedback on the clarity of the answer"
    }

    Ensure the keys are exactly "question", "userAnswer", "overallScore", "correctnessScore", "efficiencyScore", "clarityScore", "correctnessExplanation", "efficiencyExplanation", and "clarityExplanation". All scores should be integers.
    `;

export const cnPrompt = (question, answer) => `
    You are an interviewer for a Computer Networks exam. I will provide you with a question and its answer. Your task is to evaluate the answer on a scale of 0 to 100 and provide constructive feedback.

    Here is the question: "${question}"
    Here is the answer: "${answer}"

    Please evaluate the answer based on the following criteria:
    1. Overall Score: An integer score out of 100 for the overall quality of the answer.
    2. Accuracy: An integer score out of 100 for the accuracy of the answer.
    3. Clarity: An integer score out of 100 for the clarity of the answer.
    4. Completeness: An integer score out of 100 for the completeness of the answer.
    5. accuracyExplanation: Feedback on the accuracy of the answer.
    6. clarityExplanation: Feedback on the clarity of the answer.
    7. completenessExplanation: Feedback on the completeness of the answer.

    The response should be in JSON format and must follow this structure:
    {
        "question": "The question text",
        "userAnswer": "The user's answer text",
        "overallScore": 90,
        "accuracyScore": 85,
        "clarityScore": 88,
        "completenessScore": 92,
        "accuracyExplanation": "Feedback on the accuracy of the answer",
        "clarityExplanation": "Feedback on the clarity of the answer",
        "completenessExplanation": "Feedback on the completeness of the answer"
    }

    Ensure the keys are exactly "question", "userAnswer", "overallScore", "accuracyScore", "clarityScore", "completenessScore", "accuracyExplanation", "clarityExplanation", and "completenessExplanation". All scores should be integers.
    `;

export const osPrompt = (question, answer) => `
        You are an interviewer for an Operating Systems exam. I will provide you with a question and its answer. Your task is to evaluate the answer on a scale of 0 to 100 and provide constructive feedback.

        Here is the question: "${question}"
        Here is the answer: "${answer}"

        Please evaluate the answer based on the following criteria:
        1. Overall Score: An integer score out of 100 for the overall quality of the answer.
        2. Knowledge: An integer score out of 100 for the knowledge demonstrated in the answer.
        3. Clarity: An integer score out of 100 for the clarity of the answer.
        4. Depth: An integer score out of 100 for the depth of the answer.
        5. knowledgeExplanation: Feedback on the knowledge demonstrated in the answer.
        6. clarityExplanation: Feedback on the clarity of the answer.
        7. depthExplanation: Feedback on the depth of the answer.

        The response should be in JSON format and must follow this structure:
        {
            "question": "The question text",
            "userAnswer": "The user's answer text",
            "overallScore": 90,
            "knowledgeScore": 85,
            "clarityScore": 88,
            "depthScore": 92,
            "knowledgeExplanation": "Feedback on the knowledge demonstrated in the answer",
            "clarityExplanation": "Feedback on the clarity of the answer",
            "depthExplanation": "Feedback on the depth of the answer"
        }

        Ensure the keys are exactly "question", "userAnswer", "overallScore", "knowledgeScore", "clarityScore", "depthScore", "knowledgeExplanation", "clarityExplanation", and "depthExplanation". All scores should be integers.
        `;
