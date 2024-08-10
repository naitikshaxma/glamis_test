const generateQuestionsPromptForJD = (selectedCompany, jobTitle, historyPrompt, conversationHistory) => {
    let prompt = null;
    console.log(conversationHistory);

    if (selectedCompany == "Accenture") {
        if(jobTitle == "Software Engineer")
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nGenerate introductory questions. Eg- Tell me something about yourself, Tell me about your background.`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 5) {
            prompt = `${historyPrompt}\nGenerate Data Structures questions. Eg- May be output based DSA question, May be pseudocode question`;
        } else {
            prompt = `${historyPrompt}\nGenerate System Design questions.`;
        }
    }

    prompt += "Only generate one question. Make sure you do not add any question number in the beginning. Make sure you do not return an answer to the generated question."

    return prompt;
}

export default generateQuestionsPromptForJD;