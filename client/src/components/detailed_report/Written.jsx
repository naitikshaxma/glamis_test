import React from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Written = ({ data }) => {
    return (
        <div className="flex w-1/2 flex-col lg:flex-row gap-4 my-3">
            <Card className="w-full rounded-lg shadow-lg">
                <div className="bg-lightBlue-500 rounded-t-lg p-4">
                    <Typography variant="h3">Written Skills</Typography>
                </div>
                <CardBody className="flex flex-col items-center space-y-4 p-4">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart width={730} height={250} data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="score" fill="#529e5a" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </div>
    );
}

const WrittenCard = ({ prompt, userEssay, overallScore, grammarScore, vocabularyScore, contentExplanation, vocabularyExplanation, grammarExplanation, expectedEssay }) => {
    const renderFeedback = (feedback) => (
        <div className="flex w-full justify-between">
            <div className="flex flex-col space-y-2 w-1/3">Pros</div>
            <div className="flex flex-col space-y-2 w-2/3">
                <ul className='list-disc'>
                    {feedback?.Pros?.split('\n').map((line, i) => (
                        <li key={i}>
                            {line}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col space-y-2 w-1/3">Cons</div>
            <div className="flex flex-col space-y-2 w-2/3">
                <ul className='list-disc'>
                    {feedback?.Cons?.split('\n').map((line, i) => (
                        <li key={i}>
                            {line}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col bg-lightBlue-500 rounded-lg p-4 mb-4">
            <div className="flex flex-col space-y-2 font-semibold mb-4">
                <Typography variant="h5">Essay Prompt:</Typography>
                <p className="text-lg font-semibold p-4 h-fit max-h-[40vh] text-justify overflow-y-auto bg-gray-100 rounded">{prompt}</p>
            </div>
            <div className="flex gap-4 my-2 flex-wrap">
                <p className="font-semibold p-2 bg-green-100 rounded">Overall Score: {overallScore}/100</p>
                <p className="font-semibold p-2 bg-blue-100 rounded">Grammar: {grammarScore}/100</p>
                <p className="font-semibold p-2 bg-yellow-100 rounded">Vocabulary: {vocabularyScore}/100</p>
            </div>
            <div className="flex flex-col space-y-2 mt-4">
                <Typography variant="h5">User Essay:</Typography>
                <div className="flex flex-col space-y-2 p-3 bg-gray-800 rounded-lg text-white max-h-[30vh] overflow-y-auto">
                    {userEssay}
                </div>
                <Typography variant="h5" className="mt-4">Expected Essay / Feedback Guidance:</Typography>
                <div className="flex flex-col space-y-2 p-3 bg-gray-800 rounded-lg text-white max-h-[30vh] overflow-y-auto">
                    {expectedEssay}
                </div>
                <div className="flex flex-col space-y-4 bg-gray-100 rounded-lg p-4 mt-4 text-gray-900">
                    <Typography variant="h5" color="blue-gray">Content Feedback</Typography>
                    <hr className="border-gray-300" />
                    {renderFeedback(contentExplanation)}
                    <hr className="border-gray-300" />
                    <Typography variant="h5" color="blue-gray">Vocabulary Feedback</Typography>
                    <hr className="border-gray-300" />
                    {renderFeedback(vocabularyExplanation)}
                    <hr className="border-gray-300" />
                    <Typography variant="h5" color="blue-gray">Grammar Feedback</Typography>
                    <hr className="border-gray-300" />
                    {renderFeedback(grammarExplanation)}
                </div>
            </div>
        </div>
    );
}

export { Written, WrittenCard };
