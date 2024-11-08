import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';
import { bearerInstance as instance } from "../helpers/instance.js";
import { Skeleton } from '@mui/material';
import EvaluationResult from './EvaluationResult';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Cookies from 'js-cookie';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

// Utility function to capitalize the first letter of a string
const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const Timer = (props) => {
    // If remaining time is 0, then it will automatically submit the answer
    return (
        <CountdownCircleTimer
            size={100}
            isPlaying
            duration={props.timer}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[100, 70, 40, 10]}
            onComplete={() => {
                props.setNextQuestion((prev)=>prev+1)
                props.setTimer(0); // Ensures timer is set to 0 when completed
                return [false, 0]; // Do not repeat the timer
            }}
        >
            {({ remainingTime }) => remainingTime}
        </CountdownCircleTimer>
    );
}

const LiveInterview = () => {
    const [open, setOpen] = useState(true);

    const localVideoRef = useRef();
    const [localVideoTrack, setLocalVideoTrack] = useState('');
    const [questionAudio, setQuestionAudio] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [currentDiff, setCurrentDiff] = useState("");
    const [skipQuestionCount, setSkipQuestionCount] = useState(0)
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const canvasRef = useRef(null);
    const sourceRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const [ansMetaData, setAnsMetaData] = useState({
        answer: "",
        score: 0
    });

    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    // Parse totalQuestions as an integer
    const totalQuestions = parseInt(Cookies.get("delta"), 10) || 0;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timer, setTimer] = useState(100);
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);

    // Start Recording Function
    const startRecording = async () => {
        setIsRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioCtxRef.current.createAnalyser();
            sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 2048;
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
            draw();

            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.start();
        } catch (error) {
            console.error('Error starting recording:', error);
            setIsRecording(false);
        }
    };

    // Stop Recording Function
    const stopRecording = async () => {
        setIsRecording(false);
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
        console.log("Break 02");
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            console.log("Break 02.1");
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                audioChunksRef.current = [];
                console.log('Break 03');
                await handleSaveRecording(audioBlob);
                console.log('Break 07');
            };
        }
        console.log("Break 08");
    };

    // Handle Save Recording Function
    const handleSaveRecording = async (audioBlob) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('question', question);
        formData.append('answerAudio', audioBlob, `answer+${generateUniqueKey()}+${currentQuestion + 1}.webm`);
        formData.append('interviewId', Cookies.get('interviewId'));
        formData.append('difficulty', currentDiff);
        formData.append('questionNo', currentQuestion);

        try {
            const response = await instance.post(`/api/v1/interview/evaluateQuestion`, formData, {headers: {'Content-Type': 'multipart/form-data'}});
            setResults(prev => [...prev, response.data.data]);
            return;
        } catch (error) {
            console.error('Error uploading audio:', error);
        }
        setLoading(false);
    };

    // Draw Function for Audio Visualizer
    const draw = () => {
        if (!analyserRef.current || !canvasRef.current) return; // Add defensive check
        const canvasCtx = canvasRef.current.getContext('2d');
        const WIDTH = canvasRef.current.width;
        const HEIGHT = canvasRef.current.height;

        const drawVisual = requestAnimationFrame(draw);

        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        canvasCtx.fillStyle = 'rgb(256, 256, 256)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        let sliceWidth = (WIDTH * 1.0) / analyserRef.current.frequencyBinCount;
        let x = 0;

        for (let i = 0; i < analyserRef.current.frequencyBinCount; i++) {
            let v = dataArrayRef.current[i] / 128.0;
            let y = (v * HEIGHT) / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();
    };


    const fetchQuestion = async () => {
        setLoading(true);

        const subject = Cookies.get('subject');
        const jobTitle = Cookies.get('jobTitle');
        const selectedCompany = Cookies.get('selectedCompany');
        // const verbal = Cookies.get('verbal');  // depricated by Krish
        // const svar = Cookies.get('svar');  // depricated by Krish
        const mockType = Cookies.get('mockType');  // new check method

        let url = '';
        let data = {};

        if (mockType === 'subject') {
            url = `/api/v1/interview/generateQuestionForSubjectAdmin`;
            data = {
                subject: subject,
                interviewId: Cookies.get('interviewId'),
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                adminInterviewId: Cookies.get('adminInterviewId'),
                questionNo: currentQuestion,
            };
        }
        if (mockType === 'company') {
            url = `/api/v1/interview/generateQuestionForJDAdmin`;
            data = {
                selectedCompany: selectedCompany,
                jobTitle: jobTitle,
                jdDetails: localStorage.getItem('jd'),
                interviewId: Cookies.get('interviewId'),
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                adminInterviewId: Cookies.get('adminInterviewId'),
                questionNo: currentQuestion,
            };
        }
        if (mockType === 'verbal') {
            url = `/api/v1/interview/generateQuestionForVerbalAdmin`;
            data = {
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                interviewId: Cookies.get('interviewId'),
                questionNo: currentQuestion,
                adminInterviewId: Cookies.get('adminInterviewId'),
            };
        }
        if (mockType === 'written') {
            url = `/api/v1/interview/generateQuestionForWrittenAdmin`;
            data = {
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                interviewId: Cookies.get('interviewId'),
                questionNo: currentQuestion,
                adminInterviewId: Cookies.get('adminInterviewId'),
            };
        }
        if (mockType === 'svar') {
            url = `/api/v1/interview/generateQuestionForSvarAdmin`;
            data = {
                answer: ansMetaData.answer,
                score: ansMetaData.score,
                interviewId: Cookies.get('interviewId'),
                questionNo: currentQuestion,
                adminInterviewId: Cookies.get('adminInterviewId'),
            };
        }
        if (url === '') {
            console.error('Required cookies are missing.');
            setLoading(false);
            return;
        }

        try {
            const response = await instance.post(url, data);
            console.log(response.data.data);

            // Safely set question and related data
            setQuestion(response.data.data.question || ''); // Default to empty string if undefined
            setCurrentDiff(response.data.data.difficulty || "");
            setTimer(response.data.data.timer || 90);  // Default to 90 seconds if undefined
            setQuestionAudio(`${import.meta.env.VITE_BACKEND_URL}/api/v1/objectStore/${response.data.data.audioFileName || ''}`);
            setIsAudioPlaying(true);
            // set Timer from response

        } catch (error) {
            console.error('Error fetching question:', error);
        }

        setLoading(false);
    };

    // Effect to fetch question when currentQuestion changes
    useEffect(() => {
        if (currentQuestion < totalQuestions) {
            fetchQuestion();
        }
    }, [currentQuestion]);

    // Initialize media devices for local video
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
                setLocalVideoTrack(window.URL.createObjectURL(stream));
            })
            .catch((error) => {
                console.error('Error accessing media devices.', error);
            });
    }, []);

    // Handle Next Question
    const handleNextQuestion = async () => {
        if (isRecording) {
            console.log("Break 01");
            setQuestion('');    // Clear the question
            await stopRecording(); // Ensure stopRecording completes
            console.log("Break 09");

            setIsAudioPlaying(false);
            setTimer(0); // Reset timer
            console.log("Break 10");
            setCurrentQuestion((prev) => prev + 1);
        }
    };

    // Handle Skip Question
    const handleSkipQuestion = async () => {
        setIsAudioPlaying(false);
        setSkipQuestionCount(prevCount => prevCount+1);
        // Stop the recording if in progress
        if (isRecording) {
            setIsRecording(false);
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        }
        setLoading(true);
        console.log("Skipping to next question...");

        try {
            const formData = new FormData();
            formData.append('questionNo', currentQuestion);
            setCurrentQuestion((prev) => prev + 1);
            setQuestion('');    // Clear the question
            const defaultAudioPath = '/not-available.webm'; // Path to default audio file
            const response = await fetch(defaultAudioPath);
            const audioBlob = await response.blob(); // Convert the default audio file to a Blob

            formData.append('question', ''); // Since question is skipped, you might want to pass an empty string or a specific value
            formData.append('answerAudio', audioBlob, `answer+${generateUniqueKey()}+${currentQuestion + 1}.webm`);
            formData.append('interviewId', Cookies.get('interviewId'));
            formData.append('difficulty', currentDiff);
            console.log('Form data for skipped question:', formData);

            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/evaluateQuestion`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${Cookies.get('accessToken')}`,
                },
            });
            console.log('Question skipped successfully');

        } catch (error) {
            console.error('Error uploading default audio:', error);
        }

        setLoading(false);
    };

    // Handle Close (Unused in current code, but kept for completeness)
    const handleClose = () => {
        setOpen(false);
    };

    // Generate Unique Key for filenames
    const generateUniqueKey = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // Render Question Function
    const renderQuestion = () => {
        if (typeof question !== 'string') {
            return <p className="text-lg font-semibold p-8">No question available.</p>;
        }

        if (question.includes('```')) {
            const parts = question.split('```');
            return (
                <div
                    className="question bg-gray-200 rounded-lg text-justify h-[50rem] overflow-hidden overflow-y-scroll">
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
                <>
                    <div className="question bg-gray-200 rounded-lg text-justify">
                        <p className="text-2xl font-semibold mt-2 ml-4">
                            {capitalize(currentDiff)}
                        </p>
                        <p className="text-lg font-semibold p-6 h-fit max-h-[40vh]">
                            {question}
                        </p>
                    </div>
                    {questionAudio && (
                        <>
                            <div className="flex justify-end">
                                <Button className='w-fit bg-gray-200 text-black shadow-none' onClick={() => {
                                    setIsAudioPlaying(!isAudioPlaying);
                                }}>
                                    {isAudioPlaying ? <VolumeUpIcon /> : <VolumeOffIcon />}
                                </Button>
                            </div>
                        </>
                    )}
                </>
            );
        }
    };

    // Effect to handle disabling the Next button based on recording status
    useEffect(() => {
        const interval = setInterval(() => {
            if (isRecording) {
                setIsNextButtonDisabled(false);
            } else {
                setIsNextButtonDisabled(true);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isRecording]);

    // Effect to handle the timer countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Effect to auto-submit when timer reaches 0
    useEffect(() => {
        console.log('Timer:', timer);
        if (timer === 0) {
            // Auto-submit the answer when the timer reaches 0
            handleNextQuestion();
        }
    }, [timer]);

    // Effect to handle fullscreen mode and redirection
    useEffect(() => {
        if (!Cookies.get('interviewId')) {
            window.location.href = '/dashboard';
        }
        if (!document.fullscreenElement) {
            console.log('Requesting fullscreen...');
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Failed to enable fullscreen mode:', err);
            });

            const handleFullscreenChange = () => {
                if (!document.fullscreenElement) {
                    console.log('Exiting fullscreen...');
                    Cookies.remove('subject');
                    Cookies.remove('interviewId');
                    window.location.href = '/dashboard';
                }
            };

            document.addEventListener('fullscreenchange', handleFullscreenChange);

            // Cleanup the event listener on component unmount
            return () => {
                document.removeEventListener('fullscreenchange', handleFullscreenChange);
            };
        }
    }, []);

    return (
        <>
            {currentQuestion < totalQuestions ? (
                <>
                    <div className="flex w-full">
                        {
                            questionAudio && isAudioPlaying && (
                                <>
                                    <audio src={questionAudio} autoPlay className='hidden'></audio>
                                </>
                            )
                        }
                        <div className="flex flex-col items-center w-3/4">
                            <div className="timer-tab w-full flex justify-between p-4 items-center">
                                <div className="logo mr-4">
                                    <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS"
                                        className="h-28" />
                                </div>
                                <div className="title-and-name ml-4">
                                    <p className="text-2xl font-semibold">Interview</p>
                                    <p className="text-lg text-gray-600 font-semibold">{Cookies.get("fullName")}</p>
                                </div>
                                <div className="timer">
                                    {timer && !loading && <Timer timer={timer} setTimer={setTimer}  setNextQuestion={setCurrentQuestion} />}
                                </div>
                            </div>

                            <div className="quesion-and-action w-full mt-8">
                                <div className="w-2/3 mx-auto h-[36rem] flex flex-col justify-between">
                                    {loading ? (
                                        <Skeleton animation="wave"
                                            className='p-8 h-fit min-h-[20vh] rounded-lg max-h-[40vh]' />
                                    ) : (
                                        renderQuestion()
                                    )}
                                    <div className="audio-visualizer mt-4 flex justify-center">
                                        <canvas ref={canvasRef} width="640" height="200" />
                                    </div>
                                    <div className="actions w-full flex justify-between mt-4">
                                        <Button color="blue" ripple="light" size="lg" className="w-1/3"
                                            onClick={handleSkipQuestion}>Skip</Button>
                                        <Button
                                            color={isRecording ? "red" : "blue"}
                                            ripple="light"
                                            size="lg"
                                            className="p-4 rounded-full"
                                            onClick={isRecording ? handleNextQuestion : startRecording}
                                            title='Tap to Speak'
                                        >
                                            {isRecording ? <StopIcon /> : <MicIcon />}
                                        </Button>
                                        <Button
                                            color="blue"
                                            ripple="light"
                                            size="lg"
                                            className="w-1/3"
                                            disabled={isNextButtonDisabled || loading}
                                            onClick={handleNextQuestion}
                                        >
                                            {loading ? "Loading..." : "Next"}
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
                                        <span
                                            className="text-lg bg-blue-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{totalQuestions}</span>
                                    </div>
                                    <div className="flex justify-between w-full mt-2">
                                        <p className="text-lg">Total Skipped</p>
                                        <span
                                            className="text-lg bg-gray-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{skipQuestionCount}</span>
                                    </div>
                                    <div className="flex justify-between w-full mt-2">
                                        <p className="text-lg">Total Answered</p>
                                        <span
                                            className="text-lg bg-green-700 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{currentQuestion}</span>
                                    </div>
                                    <div className="flex justify-between w-full mt-2">
                                        <p className="text-lg">Total Left</p>
                                        <span
                                            className="text-lg bg-red-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">{totalQuestions - currentQuestion}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center w-full mt-auto my-4 p-4">
                                <Button
                                    variant='filled'
                                    color='red'
                                    size='lg'
                                    disabled={currentQuestion < totalQuestions - 1}
                                    onClick={handleSkipQuestion}
                                    className='w-full mx-3'
                                >
                                    End Interview
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                (() => {
                    // Close camera and audio if possible
                    if (localVideoRef.current && localVideoRef.current.srcObject) {
                        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                    }

                    return <EvaluationResult data={results} />;
                })()
            )}
        </>
    );
};

export default LiveInterview;

