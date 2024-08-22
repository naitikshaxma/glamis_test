const generateQuestionsPromptForWritten = (subject) => {
    let prompt = `Please ask the user to write an essay on a topic revolving around ${subject}. Make the topic unique so that the user has to think about the response.`;

    return prompt;
}

export default generateQuestionsPromptForWritten;