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

const WrittenCard = ({ prompt, userEssay, overallScore, grammarScore, vocabularyScore, contentScore, structureScore, contentExplanation, vocabularyExplanation, grammarExplanation, structureExplanation, expectedEssay }) => {
    const renderFeedback = (feedback) => (
        <div className="flex w-full justify-between">
            <div className="flex flex-col space-y-2 w-1/3">Pros</div>
            <div className="flex flex-col space-y-2 w-2/3">
                <ul className='list-disc'>
                    {feedback.Pros.split('\n').map((line, i) => (
                        <li key={i}>
                            {line}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col space-y-2 w-1/3">Cons</div>
            <div className="flex flex-col space-y-2 w-2/3">
                <ul className='list-disc'>
                    {feedback.Cons.split('\n').map((line, i) => (
                        <li key={i}>
                            {line}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col bg-lightBlue-500 rounded-lg p-4">
            <div className="flex flex-col space-y-2 font-semibold mb-4">
                <Typography variant="h5">Essay Prompt:</Typography>
                <p className="text-lg font-semibold p-8 h-fit max-h-[40vh] text-justify">{prompt}</p>
            </div>
            <p className="font-semibold my-2">Overall Score: {overallScore}/100</p>
            <p className="font-semibold my-2">Grammar Score: {grammarScore}/100</p>
            <p className="font-semibold my-2">Vocabulary Score: {vocabularyScore}/100</p>
            <p className="font-semibold my-2">Content Score: {contentScore}/100</p>
            <p className="font-semibold my-2">Structure Score: {structureScore}/100</p>
            <div className="flex flex-col space-y-2">
                <Typography variant="h5">User Essay:</Typography>
                <div className="flex flex-col space-y-2 p-3 bg-lightBlue-900 rounded-lg text-white">
                    {userEssay}
                </div>
                <Typography variant="h5" className="mt-4">Expected Essay:</Typography>
                <div className="flex flex-col space-y-2 p-3 bg-lightBlue-900 rounded-lg text-white">
                    {expectedEssay}
                </div>
                <div className="flex flex-col space-y-4 bg-lightblue-900 rounded-lg p-3 mt-4">
                    <Typography variant="h5">Content Feedback</Typography>
                    <hr />
                    {renderFeedback(contentExplanation)}
                    <hr />
                    <Typography variant="h5">Vocabulary Feedback</Typography>
                    <hr />
                    {renderFeedback(vocabularyExplanation)}
                    <hr />
                    <Typography variant="h5">Grammar Feedback</Typography>
                    <hr />
                    {renderFeedback(grammarExplanation)}
                    <hr />
                    <Typography variant="h5">Structure Feedback</Typography>
                    <hr />
                    {renderFeedback(structureExplanation)}
                </div>
            </div>
        </div>
    );
}

export { Written, WrittenCard };
