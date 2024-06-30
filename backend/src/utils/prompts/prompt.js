export const generateQuestionPrompt = (subject, answer) => {
    if (answer) {
        return `Generate a follow-up question based on the following answer: ${answer}, and return the question as a string.`;
    } else {
        return `Generate a single question about the following subject: ${subject}, and return the question as a string.`;
    }
}