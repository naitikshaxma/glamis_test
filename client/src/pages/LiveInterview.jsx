import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';
import { Skeleton } from '@mui/material';
import EvaluationResult from './EvaluationResult';

const Timer = () => {
    return (
        <CountdownCircleTimer
            size={100}
            isPlaying
            duration={60}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[45, 30, 15, 0]}
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
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const canvasRef = useRef(null);
    const sourceRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        setIsRecording(true);
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
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                audioChunksRef.current = [];
                handleSaveRecording(audioBlob);
            };
        }
    };

    const handleSaveRecording = async (audioBlob) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('question', question);
        formData.append('answerAudio', audioBlob, `answer${currentQuestion + 1}.webm`);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/evaluateQuestion`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Response:', response.data);
            setResults((prevResults) => [...prevResults, response.data.data]);
            setCurrentQuestion((prev) => prev + 1);
        } catch (error) {
            console.error('Error uploading audio:', error);
        }
        setLoading(false);
    };

    const draw = () => {
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

    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [timer, setTimer] = useState(true);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const totalQuestions = 3;

    const fetchQuestion = async () => {
        setLoading(true);
        const data = {
            subject: "Computer Networks",
        };
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/generateQuestion`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setQuestion(response.data.data.question);
            setQuestionAudio(`${import.meta.env.VITE_BACKEND_URL}/objectStore/${response.data.data.audioFileName}`);
            setIsAudioPlaying(true);
            setTimer(true);

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
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
                setLocalVideoTrack(window.URL.createObjectURL(stream));
            })
            .catch((error) => {
                console.error('Error accessing media devices.', error);
            });
    }, []);

    const handleNextQuestion = () => {
        if (isRecording) {
            stopRecording();
            setIsAudioPlaying(false);
            setTimer(false)

        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    // custom hook for access and reset timer

    return (
        <>
            {currentQuestion < totalQuestions ? (
                <>
                    <div className="flex w-full">
                        {
                            questionAudio && isAudioPlaying && (
                                <audio src={questionAudio} autoPlay className='hidden'></audio>)
                        }
                        <div className="flex flex-col items-center w-3/4">
                            <div className="timer-tab w-full flex justify-between p-4 items-center">
                                <div className="logo mr-4">
                                    <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS" className="h-28" />
                                </div>
                                <div className="title-and-name ml-4">
                                    <p className="text-2xl font-semibold">Full Stack Interview</p>
                                    <p className="text-lg text-gray-600 font-semibold">Shubh Chaturvedi | 2115000976</p>
                                </div>
                                <div className="timer">
                                    {timer && <Timer />}
                                </div>
                            </div>

                            <div className="quesion-and-action w-full mt-8">
                                <div className="w-2/3 mx-auto h-[36rem] flex flex-col justify-between">
                                    {loading ? (
                                        <Skeleton animation="wave" className='p-8 h-fit min-h-[20vh] rounded-lg max-h-[40vh]' />
                                    ) : (
                                        <div className="question bg-gray-200 rounded-lg text-justify">
                                            <p className="text-lg font-semibold p-8 h-fit max-h-[40vh]">
                                                {question}
                                            </p>
                                        </div>
                                    )}
                                    <div className="audio-visualizer mt-4 flex justify-center">
                                        <canvas ref={canvasRef} width="640" height="200" />
                                    </div>
                                    <div className="actions w-full flex justify-between mt-4">
                                        <Button color="blue" ripple="light" size="lg" className="w-1/3">Skip</Button>
                                        <Button
                                            color={isRecording ? "red" : "blue"}
                                            ripple="light"
                                            size="lg"
                                            className="p-4 rounded-full"
                                            onClick={isRecording ? stopRecording : startRecording}
                                            title='Tap to Speak'
                                        >
                                            {isRecording ? <StopIcon /> : <MicIcon />}
                                        </Button>
                                        <Button
                                            color="blue"
                                            ripple="light"
                                            size="lg"
                                            className="w-1/3"
                                            disabled={loading}
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
                            <div className="flex justify-center w-full mt-auto my-4 p-4">
                                <Button
                                    variant='filled'
                                    color='red'
                                    size='lg'
                                    onClick={handleClose}
                                    className='w-full mx-3'
                                >
                                    End Interview
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <EvaluationResult data={results} />
            )}
        </>
    );
};

export default LiveInterview;
