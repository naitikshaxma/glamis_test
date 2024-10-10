
import React, { useState, useRef, useEffect } from 'react';
import {
    Card, CardBody, Typography,
} from '@material-tailwind/react';
import {
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';



const COLORS = ['#529e5a', "#d63a3a"];


const Svar = (props) => {

    return (
        <div className="flex w-1/2 flex-col items-center m-3">
            <Card className="w-full rounded-lg shadow-lg">
                <div className="bg-lightBlue-500 rounded-t-lg p-4">
                    <Typography variant="h3">{props.varTab}</Typography>
                </div>
                <CardBody className="flex flex-row items-center space-y-4 p-4">
                    <div className="flex flex-col items-center w-1/2">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={props.correctnessScore}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {props.correctnessScore.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <Typography variant="body1" className="my-2 text-green-900 font-semibold">
                            Correctness Score: &nbsp;
                            {Math.round(props.correctnessScore[0].value)} / 100
                        </Typography>
                    </div>

                    <div className="flex flex-col items-center w-1/2">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={props.pronounciationScore}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#82ca9d"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {props.pronounciationScore.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <Typography variant="body1" className="my-2 text-green-900 font-semibold">
                            Pronunciation: &nbsp;
                            {Math.round(props.pronounciationScore[0].value)} / 100
                        </Typography>
                    </div>
                    <div className="flex flex-col items-center w-1/2">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={props.grammarScore}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#82ca9d"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {props.grammarScore.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <Typography variant="body1" className="my-2 text-green-900 font-semibold">
                            Grammar: &nbsp;
                            {Math.round(props.grammarScore[0].value)} / 100
                        </Typography>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export { Svar };

const renderFeedbackSection = (feedbackCategory, title) => {
    return (
        <>
            <div className="flex w-full justify-between">
                <div className="flex flex-col space-y-2 w-1/3">{title} - What went well</div>
                <div className="flex flex-col space-y-2 w-2/3">
                    <ul className='list-disc'>
                        {feedbackCategory.good.map((item, index) => (
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
                <div className="flex flex-col space-y-2 w-1/3">{title} - Areas for improvement</div>
                <div className="flex flex-col space-y-2 w-2/3">
                    <ul className='list-disc'>
                        {feedbackCategory.improvement.map((item, index) => (
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
        </>
    );
};

export const SvarCard = ({ question, answer, feedback, score, qno, expectedAnswer }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const renderQuestion = () => {
        return (
            <>
                <div className="question text-justify">
                    <p className="text-lg font-semibold p-8 h-fit max-h-[40vh]">
                        {question}
                    </p>
                </div>
            </>
        );
    }
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
                    {/* Render Pronunciation Feedback */}
                    {renderFeedbackSection(feedback.pronounciation, 'Pronounciation')}

                    {/* Render Correctness Feedback */}
                    {renderFeedbackSection(feedback.correctness, 'Correctness')}

                    {/* Render Grammar Feedback */}
                    {renderFeedbackSection(feedback.grammar, 'Grammar')}
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
    );
}