import React, { useState, useRef, useEffect } from 'react';
import {
    Card, CardBody, Typography,
} from '@material-tailwind/react';
import {
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';


const COLORS = ['#529e5a', "#d63a3a"];

export const TechnicalCard = ({ question, answer, feedback, score, qno, expectedAnswer }) => {
    const [showAnswer, setShowAnswer] = useState(false);
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
            <p className="font-semibold my-2">Score : {score}/100</p>
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
                    <div className="px-2">
                        <button
                            className="bg-black text-white rounded-lg p-2 shadow-lg px-4 font-semibold"
                            onClick={() => setShowAnswer(!showAnswer)}
                        >
                            Expected Answer
                        </button>
                        <div className='block mt-4'>
                            {showAnswer && (
                                expectedAnswer
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Technical = (props) => {

    return (
        <div className="flex w-1/2 flex-col items-center m-3">
            <Card className="w-full rounded-lg shadow-lg">
                <div className="bg-lightBlue-500 rounded-t-lg p-4">
                    <Typography variant="h3">{props.varTab}</Typography>
                </div>
                <CardBody className="flex flex-col items-center space-y-4 p-4">
                    <ResponsiveContainer width="50%" height={250}>
                        <PieChart>
                            <Pie data={props.technicalScore} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                {props.technicalScore.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <Typography variant="body1" className="my-2 text-green-900 font-semibold">Domain Knowledge: &nbsp;
                        {
                            Math.round(props.technicalScore[0].value)
                        } / 100
                    </Typography>
                </CardBody>
            </Card>
        </div>
    );
}

export default Technical;
