export const generateQuestionPrompt = (subject, answer) => {
    if (answer) {
        return `Generate a follow-up question based on the following answer: ${answer}, and return the question as a string.`;
    } else {
        return `Generate a scenario based question about the following subject: ${subject}, and return the question as a string. just send the question directly without any other information. Try to make the question as open-ended as possible.`;
    }
}