const generateQuestionsPromptForJD = (selectedCompany, jobTitle, historyPrompt, conversationHistory) => {
    let prompt = null;

    let JD = '';

    // Job descriptions based on company and role
    if (selectedCompany == "Accenture") {
        if (jobTitle == "Software Engineer") {
            JD = `
                Develop and maintain applications using Java and related technologies.
                Apply strong knowledge of data structures, algorithms, OOP concepts, DBMS, operating systems, computer networks, software engineering principles, web technologies, cloud computing, cybersecurity, and AI/ML.
                Demonstrate excellent problem-solving and communication skills.
                Collaborate with Product/Business teams to understand requirements and propose efficient technical solutions.
                Innovate and implement solutions for daily technical challenges.
                Troubleshoot, test, and optimize core software and databases.
                Contribute to all development lifecycle phases.
            `;
        } else if (jobTitle == "Backend Developer") {
            JD = `
                Design, develop, and maintain server-side logic using programming languages like Java, Python, or Node.js.
                Implement APIs, data storage solutions, and business logic to support frontend applications.
                Optimize backend performance and ensure security and scalability.
                Collaborate with frontend developers and database administrators.
                Troubleshoot, debug, and upgrade existing systems.
                Write unit tests and ensure code quality through code reviews.
            `;
        } else if (jobTitle == "Frontend Developer") {
            JD = `
                Design and implement user interfaces using HTML, CSS, JavaScript, and frontend frameworks.
                Collaborate with designers and backend developers to create responsive and user-friendly web applications.
                Optimize web applications for performance and accessibility.
                Stay updated with the latest frontend technologies and best practices.
                Troubleshoot and debug frontend issues across different browsers and devices.
                Write clean, maintainable, and efficient code.
            `;
        } else if (jobTitle == "Full Stack Developer") {
            JD = `
                Work on both frontend and backend development using a wide range of technologies.
                Design, develop, and maintain full-stack applications.
                Optimize applications for performance, security, and scalability.
                Collaborate with cross-functional teams to deliver high-quality software.
                Write clean, maintainable code and perform code reviews.
                Stay updated with industry trends and best practices.
            `;
        } else if (jobTitle == "DevOps Engineer") {
            JD = `
                Implement and manage CI/CD pipelines for automated testing and deployment.
                Collaborate with development and operations teams to ensure smooth and reliable software releases.
                Optimize infrastructure for scalability, security, and cost-efficiency.
                Troubleshoot and resolve issues in development, testing, and production environments.
                Stay updated with the latest DevOps tools and practices.
            `;
        } else if (jobTitle == "ML Engineer" || jobTitle == "AI Engineer") {
            JD = `
                Design, develop, and deploy machine learning models and AI systems.
                Apply knowledge of algorithms, neural networks, and deep learning frameworks.
                Work with large datasets to train, validate, and optimize models.
                Collaborate with data scientists and software engineers to integrate models into production.
                Troubleshoot and enhance model performance.
                Stay updated with the latest trends and advancements in AI/ML.
                Document and maintain code for reproducibility and scalability.
            `;
        }
    } else if (selectedCompany == "KPIT") {
        if (jobTitle == "Software Engineer") {
            JD = `
                Develop embedded software for automotive systems.
                Apply strong knowledge of C/C++, AUTOSAR, and automotive protocols.
                Collaborate with cross-functional teams to deliver high-quality software.
                Perform software integration, testing, and debugging.
                Ensure compliance with automotive safety standards.
            `;
        } else if (jobTitle == "Backend Developer") {
            JD = `
                Design and implement backend services for automotive applications.
                Work with cloud platforms to develop scalable and secure systems.
                Collaborate with frontend developers to provide seamless integration.
                Optimize performance and troubleshoot issues in live environments.
                Ensure high availability and reliability of backend services.
            `;
        } else if (jobTitle == "Frontend Developer") {
            JD = `
                Develop user interfaces for automotive applications.
                Ensure responsive design and compatibility across devices.
                Collaborate with designers to implement intuitive UIs.
                Optimize frontends for performance and reliability.
                Stay updated with the latest web technologies and frameworks.
            `;
        } else if (jobTitle == "Full Stack Developer") {
            JD = `
                Develop full-stack solutions for automotive applications.
                Work on both frontend and backend to deliver complete features.
                Ensure seamless integration between client and server.
                Optimize the performance and scalability of applications.
                Collaborate with teams across different disciplines.
            `;
        } else if (jobTitle == "DevOps Engineer") {
            JD = `
                Implement CI/CD pipelines for automotive software projects.
                Ensure the security and scalability of cloud infrastructure.
                Automate deployment processes to improve efficiency.
                Collaborate with development teams to integrate new tools and practices.
                Monitor and troubleshoot production systems.
            `;
        } else if (jobTitle == "ML Engineer" || jobTitle == "AI Engineer") {
            JD = `
                Develop AI and ML solutions for automotive use cases.
                Work with large datasets to train models for vehicle autonomy.
                Collaborate with engineers to integrate AI into automotive systems.
                Optimize model performance for real-time applications.
                Stay updated with the latest trends in automotive AI/ML.
            `;
        }
    } else if (selectedCompany == "Gemini Solutions") {
        if (jobTitle == "Software Engineer") {
            JD = `
                Develop enterprise-level software solutions using modern technologies.
                Apply strong understanding of data structures, algorithms, and system design.
                Collaborate with cross-functional teams to deliver high-quality products.
                Troubleshoot and debug issues across the software stack.
                Contribute to the full software development lifecycle.
            `;
        } else if (jobTitle == "Backend Developer") {
            JD = `
                Design and develop robust backend services using Java, Python, or Node.js.
                Work with databases and caching mechanisms to optimize performance.
                Collaborate with frontend developers and product managers to ensure seamless integration.
                Implement security best practices to protect data and services.
                Write and maintain comprehensive unit tests.
            `;
        } else if (jobTitle == "Frontend Developer") {
            JD = `
                Build dynamic and responsive user interfaces using React.js, Angular, or Vue.js.
                Work closely with UX/UI designers to implement pixel-perfect designs.
                Optimize frontend performance to ensure fast load times and smooth interactions.
                Collaborate with backend developers to integrate APIs and services.
                Troubleshoot and resolve frontend issues.
            `;
        } else if (jobTitle == "Full Stack Developer") {
            JD = `
                Develop end-to-end solutions, handling both frontend and backend tasks.
                Optimize applications for performance, scalability, and security.
                Collaborate with designers, product managers, and other developers to deliver features.
                Stay updated with the latest web technologies and frameworks.
                Contribute to code reviews and maintain high code quality standards.
            `;
        } else if (jobTitle == "DevOps Engineer") {
            JD = `
                Manage and optimize cloud infrastructure for scalable software deployments.
                Implement and maintain CI/CD pipelines to streamline development processes.
                Automate deployment tasks using scripting languages like Bash, Python, or Go.
                Monitor production environments and troubleshoot issues as they arise.
                Ensure system security and compliance with industry standards.
            `;
        } else if (jobTitle == "ML Engineer" || jobTitle == "AI Engineer") {
            JD = `
                Design and implement machine learning models for enterprise applications.
                Collaborate with data scientists and software engineers to bring models into production.
                Optimize model performance for real-time use cases.
                Document processes and code for reproducibility and future reference.
                Stay current with the latest developments in AI and ML technologies.
            `;
        }
    } else if (selectedCompany == "Capgemini") {
        if (jobTitle == "Software Engineer") {
            JD = `
                Develop and maintain enterprise-level applications using Java, .NET, or other modern technologies.
                Apply strong knowledge of data structures, algorithms, and system design.
                Collaborate with business analysts and other developers to deliver solutions that meet client requirements.
                Troubleshoot and optimize existing systems to improve performance.
                Contribute to code reviews and follow best practices in software development.
            `;
        } else if (jobTitle == "Backend Developer") {
            JD = `
                Design, implement, and maintain backend services using Java, Python, or .NET.
                Work with relational and NoSQL databases to store and retrieve data efficiently.
                Collaborate with frontend developers to integrate APIs and services.
                Ensure the security and scalability of backend services.
                Write and maintain unit and integration tests.
            `;
        } else if (jobTitle == "Frontend Developer") {
            JD = `
                Develop and maintain user interfaces for enterprise-level applications.
                Work with frameworks like Angular, React, or Vue.js to build dynamic web applications.
                Collaborate with designers to ensure UI/UX consistency across the application.
                Optimize frontend code for performance and accessibility.
                Troubleshoot and resolve frontend issues across different browsers and devices.
            `;
        } else if (jobTitle == "Full Stack Developer") {
            JD = `
                Develop full-stack applications using a range of frontend and backend technologies.
                Work closely with other developers, designers, and product managers to deliver complete solutions.
                Optimize applications for performance, scalability, and security.
                Write clean, maintainable code and participate in code reviews.
                Stay updated with the latest trends and technologies in full-stack development.
            `;
        } else if (jobTitle == "DevOps Engineer") {
            JD = `
                Manage cloud infrastructure and implement automation tools to streamline deployment processes.
                Work with development teams to integrate DevOps practices into the software development lifecycle.
                Monitor and troubleshoot production systems to ensure reliability and performance.
                Implement security best practices and ensure compliance with industry standards.
                Automate repetitive tasks to improve efficiency and reduce errors.
            `;
        } else if (jobTitle == "ML Engineer" || jobTitle == "AI Engineer") {
            JD = `
                Design and develop machine learning models and AI systems for enterprise clients.
                Collaborate with data scientists and software engineers to bring AI solutions to production.
                Optimize models for performance, scalability, and accuracy.
                Stay updated with the latest trends and advancements in AI and ML.
                Document and maintain code to ensure reproducibility and scalability.
            `;
        }
    }

    // Generating questions based on conversation history length
    if (conversationHistory.length == 1) {
        // First three questions: Straightforward, concept-based (non-coding)
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a basic and conceptual technical question related to the job title ${jobTitle} for ${selectedCompany}.\n${JD}`;
    } else if (conversationHistory.length == 2) {
        let codeSnippetLanguage;
        if (jobTitle == "Frontend Developer" || jobTitle == "Backend Developer" || jobTitle == "Full Stack Developer") {
            codeSnippetLanguage = "JavaScript";
        } else if (jobTitle == "Software Engineer") {
            codeSnippetLanguage = "Java";
        } else if (jobTitle == "ML Engineer" || jobTitle == "AI Engineer") {
            codeSnippetLanguage = "Python";
        }
        // Next four questions: Coding questions related to the JD and role
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a new coding question (output based) for a ${jobTitle} interview at ${selectedCompany}. Provide a ${codeSnippetLanguage} code snippet and ask the user to predict the output of the problem or explain the code:\n\n\`\`\`java\n// Your code snippet here\n\`\`\`\n\nEnsure the question is relevant to the job description and appropriately challenging.`;
    } else {
        // Remaining three questions: Scenario-based, related to real-world tasks
        prompt = `${historyPrompt}\nBased on the previous questions and answers, generate a scenario-based question for a ${jobTitle} interview at ${selectedCompany}. The question should involve real-world tasks and challenges directly related to the job description and role.\n\n${JD}`;
    }

    // Final instruction to generate only one question
    prompt += " Only generate one question. Do not include a question number or return an answer to the generated question.";

    return prompt;
}

export default generateQuestionsPromptForJD;
