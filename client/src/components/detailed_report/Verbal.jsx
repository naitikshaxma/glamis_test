import React from 'react';
import {
    Card, CardBody, Typography
} from '@material-tailwind/react';
import { ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const Verbal = ({ data }) => {
    return (
        <div className="flex w-1/2 flex-col lg:flex-row gap-4 my-3">
            <Card className="w-full rounded-lg shadow-lg">
                <div className="bg-lightBlue-500 rounded-t-lg p-4">
                    <Typography variant="h3">Verbal Skills</Typography>
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

const VerbalCard = ({ question, answer, feedback, grammarScore, vocabularyScore, qno, expectedAnswer }) => {
    const renderQuestion = () => {
        if (question.includes('```')) {
            const parts = question.split('```');
            return (
                <div className="question text-justify">
                    {parts.map((part, index) => {
                        if (index % 2 === 1) {
                            return (
                                <SyntaxHighlighter key={index} language="java" style={docco}>
                                    {part}
                                </SyntaxHighlighter>
                            );
                        } else {
                            return (
                                <p key={index}>
                                    {part.replace(/Q\d*\s*:\s*/g, '')}
                                </p>
                            );
                        }
                    })}
                </div>
            );
        } else {
            return (
                <>
                    <div className="question text-justify">
                        <p className="text-lg font-semibold p-8 h-fit max-h-[40vh]">
                            {question.replace(/Q\d*\s*:\s*/g, '')}
                        </p>
                    </div>
                </>
            );
        }
    };
    return (
        <div className="flex  flex-col bg-lightBlue-500 rounded-lg p-4">
            <div className="flex flex-col space-y-2 font-semibold mb-4">
                Question {qno + 1} : {renderQuestion()}
            </div>
            <p className="font-semibold my-2">Grammar Score : {grammarScore}/100</p>
            <p className="font-semibold my-2">Vocabulary Score : {vocabularyScore}/100</p>
            <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-2">
                    <strong>Your Answer:</strong>
                    {answer}
                </div>
                <div className="flex flex-col space-y-2 bg-lightblue-900 rounded-lg p-3">
                    <div className="flex flex-col space-y-2 font-semibold">Feedback</div>
                    <hr />
                    <div className='flex w-full justify-between font-semibold'>
                        <div className="flex flex-col space-y-2 font-semibold w-1/3">Attributes</div>
                        <div className="flex flex-col space-y-2 font-semibold w-2/3">Description</div>
                    </div>
                    <hr />
                    <div className="flex w-full justify-between">
                        <div className="flex flex-col space-y-2 w-1/3">What went well</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className='list-disc'>
                                {Object.values(feedback.good).map((item, index) => (
                                    item.split('\n').map((line, i) => (
                                        <li key={`${index}-${i}`}>
                                            {line}
                                        </li>
                                    ))
                                ))}
                            </ul>
                        </div>
                    </div>
                    <hr />
                    <div className="flex w-full justify-between">
                        <div className="flex flex-col space-y-2 w-1/3">Areas for improvement</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className='list-disc'>
                                {Object.values(feedback.improvement).map((item, index) => (
                                    item.split('\n').map((line, i) => (
                                        <li key={`${index}-${i}`}>
                                            {line}
                                        </li>
                                    ))
                                ))}
                            </ul>
                        </div>
                    </div>
                    <hr />
                </div>
            </div>
        </div>
    );
}

export { VerbalCard, Verbal };