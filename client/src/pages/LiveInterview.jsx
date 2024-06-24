import React, { useState } from 'react';
import {
    Card,
    CardBody,
    Input,
    Button,
    Typography
} from '@material-tailwind/react';

const LiveInterview = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('Dummy AI response'); // Add state for AI response

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Handle submitting the question to the AI
        setResponse('The AI is thinking...'); // Simulate AI response update
        setQuestion('');
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <CardBody>
                    <Typography variant="h4" className="text-center mb-6">
                        Live Interview
                    </Typography>
                    <div className="bg-gray-200 p-4 rounded mb-6 flex justify-center items-center">
                        {/* TODO: Add live video component */}
                        <Typography variant="h6">Live Video Placeholder</Typography>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            type="text"
                            value={question}
                            onChange={handleQuestionChange}
                            placeholder="Ask a question"
                            size="lg"
                        />
                        <Button type="submit" color="blue">
                            Submit
                        </Button>
                    </form>
                    <div className="mt-6">
                        {/* Display AI's response */}
                        <Typography variant="paragraph" className="text-gray-700">
                            {response}
                        </Typography>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default LiveInterview;
