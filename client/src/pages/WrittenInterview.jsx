import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import axios from 'axios';
import { Skeleton } from '@mui/material';
import EvaluationResult from './EvaluationResult';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Cookies from 'js-cookie';

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
    const [open, setOpen] = useState(true);

    const localVideoRef = useRef();

    const [ansMetaData, setAnsMetaData] = useState({
        answer: "",
        score: 0
    })

    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [timer, setTimer] = useState(120);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const totalQuestions = parseInt(Cookies.get("delta"), 10) || 10; // Default to 10 if not set

    const [userAnswer, setUserAnswer] = useState('');

    // If someone copies the URL and pastes it in another tab, show 404 page
    // Force the user into full screen mode
    useEffect(() => {
        if (!Cookies.get('interviewId')) {
            window.location.href = '/dashboard';
        }
        if (!document.fullscreenElement) {
            console.log('Requesting fullscreen...');
            document.documentElement.requestFullscreen();

            const handleFullscreenChange = () => {
                if (!document.fullscreenElement) {
                    console.log('Exiting fullscreen...');
                    Cookies.remove('subject');
                    Cookies.remove('interviewId');
                    window.location.href = '/dashboard';
                }
            };

            document.addEventListener('fullscreenchange', handleFullscreenChange);

            return () => {
                document.removeEventListener('fullscreenchange', handleFullscreenChange);
            };
        }
    }, []);

    const fetchQuestion = async () => {
        setLoading(true);

        const subject = Cookies.get('subject');
        const jobTitle = Cookies.get('jobTitle');
        const selectedCompany = Cookies.get('selectedCompany');
        const verbal = Cookies.get('verbal');

        let url;
        let data;

        if (subject && !jobTitle && !selectedCompany && !verbal) {
            url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/generateQuestionForWrittenAdmin`;
            data = {
                subject: subject,
                interviewId: Cookies.get('interviewId'),
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                adminInterviewId: Cookies.get('adminInterviewId'),
                questionNo: currentQuestion,
            };
        } else if (jobTitle && selectedCompany && !subject && !verbal) {
            url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/generateQuestionForWrittenAdmin`;
            data = {
                selectedCompany: Cookies.get('selectedCompany'),
                jobTitle: Cookies.get('jobTitle'),
                jdDetails: localStorage.getItem('jd'),
                interviewId: Cookies.get('interviewId'),
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                adminInterviewId: Cookies.get('adminInterviewId'),
                questionNo: currentQuestion,
            }
        }
        else if (verbal && !subject && !jobTitle && !selectedCompany) {
            url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/generateQuestionForWrittenAdmin`;
            data = {
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                interviewId: Cookies.get('interviewId'),
                questionNo: currentQuestion,
                adminInterviewId: Cookies.get('adminInterviewId'),
            };
        }
        else {
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
            setUserAnswer('');
        } catch (error) {
            console.error('Error fetching question:', error);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (currentQuestion < totalQuestions) {
            fetchQuestion();
        }
    }, [currentQuestion]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
                setLocalVideoTrack(window.URL.createObjectURL(stream));
            })
            .catch((error) => {
                console.error('Error accessing media devices.', error);
            });
    }, []);

    const handleNextQuestion = async () => {
        setCurrentQuestion((prev) => prev + 1);
        await handleSaveAnswer();
        console.log("saved")
    };

    const handleClose = () => {
        setOpen(false);
    };

    const generateUniqueKey = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    const handleSaveAnswer = async () => {
        if (!userAnswer.trim()) {
            alert('Please enter your answer before proceeding.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/evaluateQuestionWritten`, {
                question: question,
                answer: userAnswer,
                interviewId: Cookies.get('interviewId'),
                questionNo: currentQuestion,
                adminInterviewId: Cookies.get('adminInterviewId'),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('accessToken')}`,
                },
            });

            console.log("Answer: ", userAnswer)
            console.log(response.data)

            // Assuming the response contains the evaluation result
            setAnsMetaData({
                answer: userAnswer,
                score: response.data.contentScore,
            });

            setResults(prev => [...prev, response.data.data]);
        } catch (error) {
            console.error('Error uploading answer:', error);
        }
        finally {
            setLoading(false);
        }
    };

    const renderQuestion = () => {
        if (question.includes('```')) {
            const parts = question.split('```');
            return (
                <div className="question bg-gray-200 rounded-lg text-justify h-[50rem] overflow-hidden overflow-y-scroll">
                    {parts.map((part, index) => {
                        if (index % 2 === 1) {
                            // Code snippet part
                            return (
                                <SyntaxHighlighter key={index} language="javascript" style={docco}>
                                    {part}
                                </SyntaxHighlighter>
                            );
                        } else {
                            // Text part
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

    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            if (userAnswer.trim()) {
                setIsNextButtonDisabled(false);
            } else {
                setIsNextButtonDisabled(true);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [userAnswer]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log('Timer:', timer);
        if (timer === 0) {
            // Auto-submit the answer when the timer reaches 0
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
                                {timer > 0 && <Timer duration={timer} />}
                            </div>
                        </div>

                        <div className="question-and-action w-full mt-8">
                            <div className="w-2/3 mx-auto h-[36rem] flex flex-col justify-between">
                                {loading ? (
                                    <Skeleton animation="wave" className='p-8 h-fit min-h-[20vh] rounded-lg max-h-[40vh]' />
                                ) : (
                                    renderQuestion()
                                )}
                                <div className="mt-4">
                                    <textarea
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-none"
                                    ></textarea>
                                </div>
                                <div className="actions w-full flex justify-between mt-4">
                                    <Button
                                        color="blue"
                                        ripple="light"
                                        size="lg"
                                        className="w-1/3"
                                        onClick={handleNextQuestion}
                                        disabled={isNextButtonDisabled}
                                    >
                                        {loading ? "Loading..." : "Next"}
                                    </Button>
                                    <Button
                                        color="red"
                                        ripple="light"
                                        size="lg"
                                        className="w-1/3"
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to skip this question?")) {
                                                setCurrentQuestion((prev) => prev + 1);
                                            }
                                        }}
                                    >
                                        Skip
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/4 h-screen bg-blue-gray-100 bg-opacity-50 items-center">
                        <div className="flex justify-center w-[25rem] m-3">
                            <video ref={localVideoRef} autoPlay muted className="rounded-lg h-[15rem]"></video>
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
                                    <span className="text-lg bg-gray-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{currentQuestion - results.length - 1}</span>
                                </div>
                                <div className="flex justify-between w-full mt-2">
                                    <p className="text-lg">Total Answered</p>
                                    <span className="text-lg bg-green-700 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{results.length}</span>
                                </div>
                                <div className="flex justify-between w-full mt-2">
                                    <p className="text-lg">Total Left</p>
                                    <span className="text-lg bg-red-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{totalQuestions - currentQuestion}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center w-full mt-auto my-4 p-4">
                            <Button
                                variant='filled'
                                color='red'
                                size='lg'
                                disabled={currentQuestion < totalQuestions}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to end the interview?")) {
                                        setCurrentQuestion(totalQuestions);
                                    }
                                }}
                                className='w-full mx-3'
                            >
                                End Interview
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                (() => {
                    // Close camera and audio
                    if (localVideoRef.current && localVideoRef.current.srcObject) {
                        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                    }
                    return <EvaluationResult data={results} />;
                })()
            )}
        </>
    );
};

export default WrittenInterview;
