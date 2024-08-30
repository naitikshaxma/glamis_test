import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import axios from 'axios';
import { Skeleton } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Cookies from 'js-cookie';
import EvaluationResult from './EvaluationResult';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

const Timer = (props) => {
    return (
        <CountdownCircleTimer
            size={100}
            isPlaying
            duration={props.duration ||300}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[300 , 200 , 100 , 30]}
        >
            {({ remainingTime }) => remainingTime}
        </CountdownCircleTimer>
    );
}

const WrittenInterview = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const totalQuestions = 10;
    const [timer, setTimer] = useState(300);
    const [results, setResults] = useState([]);

    // Handle fetching questions from the server
    const fetchQuestion = async () => {
        setLoading(true);

        const subject = Cookies.get('subject');

        let url;
        let data;

        if (subject) {
            url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/generateQuestionForWrittenAdmin`;
            data = {
                // subject, answer, score, interviewId, questionNo, adminInterviewId
                subject: subject,
                interviewId: Cookies.get('interviewId'),
                answer: answer,
                questionNo: currentQuestion,
                adminInterviewId: Cookies.get('adminInterviewId'),

            };
        } else {
            console.error('Required cookies are missing.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${Cookies.get('accessToken')}`
                },
            });

            setQuestion(response.data.data.question);
            setTimer(300);

        } catch (error) {
            console.error('Error fetching question:', error);
        }

        setLoading(false);
    };

    const handleNextQuestion = async () => {
        setLoading(true);
        await handleSaveAnswer();
        setAnswer('');
        setCurrentQuestion((currentQuestion => currentQuestion + 1));
        setLoading(false);
    };

    const handleSaveAnswer = async () => {
        const data = {
            question: question,
            answer: answer,
            interviewId: Cookies.get('interviewId'),
        }

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/evaluateQuestionWritten`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('accessToken')}`,
                },
            });
        } catch (error) {
            console.error('Error saving answer:', error);
        }
    };

    const renderQuestion = () => {
        if (question.includes('```')) {
            const parts = question.split('```');
            return (
                <div className="question bg-gray-200 rounded-lg text-justify h-[50rem] overflow-hidden overflow-y-scroll">
                    {parts.map((part, index) => {
                        if (index % 2 === 1) {
                            return (
                                <SyntaxHighlighter key={index} language="javascript" style={docco}>
                                    {part}
                                </SyntaxHighlighter>
                            );
                        } else {
                            return (
                                <p key={index} className="text-lg font-semibold p-8 h-fit max-h-[40vh]">
                                    {part}
                                </p>
                            );
                        }
                    })}
                </div>
            );
        } else {
            return (
                <div className="question bg-gray-200 rounded-lg text-justify">
                    <p className="text-lg font-semibold p-8 h-fit max-h-[40vh]">
                        {question}
                    </p>
                </div>
            );
        }
    };

    useEffect(() => {
        if (!Cookies.get('interviewId')) {
            window.location.href = '/dashboard';
        }

        if (!document.fullscreenElement) {
            console.log('Requesting fullscreen...');
            document.documentElement.requestFullscreen();

            document.addEventListener('fullscreenchange', (event) => {
                if (!document.fullscreenElement) {
                    console.log('Exiting fullscreen...');
                    Cookies.remove('subject');
                    Cookies.remove('interviewId');
                    window.location.href = '/dashboard';
                }
            });
        }
    }, []);

    useEffect(() => {
        if (currentQuestion < totalQuestions) {
            fetchQuestion();
        }
    }, [currentQuestion]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (timer === 0) {
            handleNextQuestion();
        }
    }, [timer]);

    return (
        <>
            {currentQuestion < totalQuestions ? (
                <div className="flex w-full">
                    <div className="flex flex-col items-center w-3/4">
                        <div className="timer-tab w-full flex justify-between p-4 items-center">
                            <div className="logo mr-4">
                                <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS" className="h-28" />
                            </div>
                            <div className="title-and-name ml-4">
                                <p className="text-2xl font-semibold">Interview</p>
                                <p className="text-lg text-gray-600 font-semibold">Demo User</p>
                            </div>
                            <div className="timer">
                                <Timer duration={timer} />
                            </div>
                        </div>

                        <div className="question-and-input w-full mt-8">
                            <div className="w-2/3 mx-auto h-[36rem] flex flex-col justify-between">
                                {loading ? (
                                    <Skeleton animation="wave" className='p-8 h-fit min-h-[20vh] rounded-lg max-h-[40vh]' />
                                ) : (
                                    <>
                                        {renderQuestion()}
                                        <textarea
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            className="mt-4 p-4 w-full h-40 border border-gray-300 rounded-lg"
                                            placeholder="Type your answer here..."
                                        />
                                        <div className="actions w-full flex justify-between mt-4">
                                            <Button
                                                color="blue"
                                                ripple="light"
                                                size="lg"
                                                className="w-1/2"
                                                onClick={handleNextQuestion}
                                            >
                                                {loading ? "Loading..." : "Next"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/4 h-screen bg-blue-gray-100 bg-opacity-50 items-center">
                        <div className="flex justify-center w-[25rem] m-3">
                            {/* Placeholder for video component if needed */}
                        </div>
                        <div className="flex flex-col items-center w-full p-4">
                            <p className="text-lg font-semibold">Interview Summary</p>
                            <div className="flex flex-col items-center w-full mt-4">
                                <div className="flex justify-between w-full">
                                    <p className="text-lg">Total Questions</p>
                                    <span className="text-lg bg-blue-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{totalQuestions}</span>
                                </div>
                                <div className="flex justify-between w-full mt-2">
                                    <p className="text-lg">Total Skipped</p>
                                    <span className="text-lg bg-gray-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">0</span>
                                </div>
                                <div className="flex justify-between w-full mt-2">
                                    <p className="text-lg">Total Answered</p>
                                    <span className="text-lg bg-green-700 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{currentQuestion}</span>
                                </div>
                                <div className="flex justify-between w-full mt-2">
                                    <p className="text-lg">Total Left</p>
                                    <span className="text-lg bg-red-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{totalQuestions - currentQuestion}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <EvaluationResult data={results} />
            )}
        </>
    );
};

export default WrittenInterview;
