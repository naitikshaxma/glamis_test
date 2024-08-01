
const generateQuestionsPrompt = (subject, conversationHistory, historyPrompt, difficulty) => {

    let prompt = null;
    let subjectType = subject;

    if (subjectType === "Data Structures and Algorithms") {
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
    }

    else if (subjectType === "Database Management Systems") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} generic question for DBMS`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} SQL query question for DBMS`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for DBMS`;
        }
    }

    else if (subjectType === "Operating Systems") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} generic question for Operating Systems`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} conceptual question (e.g., round robin, semaphores) for Operating Systems`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Operating Systems`;
        }
    }

    else if (subjectType === "Machine Learning") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Machine Learning`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} output-based question for Machine Learning`;
        }
        else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Machine Learning`;
        }
    }

    else if(subjectType === "Cloud Computing") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Cloud Computing`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Cloud Computing related to docker and kubernetes ansible etc`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Cloud Computing related to system design aws, azure, gcp etc`;
        }
    }

    else if(subjectType === "Web Development") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Web Development`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Web Development related to frontend technologies , react, state management etc`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Web Development related to backend technologies, MVC architecture, prisma , graphql etc`;
        }
    }

    else if(subjectType === "Cyber Security") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Cyber Security`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Cyber Security related to encryption, decryption etc`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Cyber Security related to network security, firewalls etc`;
        }
    }

    else if(subjectType === "Java") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Java`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Java related to multithreading, exception handling etc`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Java related to file handling, collections etc`;
        }
    }

    else if(subjectType === "Python") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for Python`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Python related to decorators, generators etc`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for Python related to file handling, data structures etc`;
        }
    }

    else if(subjectType === "C/C++") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for C/C++`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for C/C++ related to pointers, memory management etc`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for C/C++ related to file handling, data structures etc`;
        }
    }

    else if(subjectType === "Javascript") {
        if (conversationHistory.length < 3) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} concept-based question for JavaScript`;
        } else if (conversationHistory.length >= 3 && conversationHistory.length < 7) {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for JavaScript related to event loop, promises etc`;
        } else {
            prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new ${difficulty} scenario-based question for JavaScript related to closures, callbacks etc`;
        }
    }

    // Handle prompt generation failure

    if (!prompt) {
        return { error: 'Failed to generate prompt for the specified subject' };
    }

    return prompt;
}

export default generateQuestionsPrompt;