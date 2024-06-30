import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';

//timer
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

    const [isRecording, setIsRecording] = useState(false);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const canvasRef = useRef(null);
    const sourceRef = useRef(null);
<<<<<<< Updated upstream
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

        // Initialize MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
=======
>>>>>>> Stashed changes
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
<<<<<<< Updated upstream
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                convertToMp3(audioBlob);
                audioChunksRef.current = [];
            };
        }
    };

    const handleDataAvailable = (event) => {
        chunksRef.current.push(event.data);
    };

    const handleSaveRecording = () => {
        setIsRecording(false);
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('answerAudio', audioBlob, 'answer01.webm');
                try {
                    const response = await axios.post('http://localhost:8000/api/v1/interview/evaluateQuestion' , formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    });
                    console.log('Response:', response.data);
                } catch (error) {
                    console.error('Error uploading audio:', error);
                }
                audioChunksRef.current = [];
            }
        }
=======
>>>>>>> Stashed changes
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

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
                setLocalVideoTrack(window.URL.createObjectURL(stream));
                localAudioRef.current = new MediaRecorder(stream);
                localAudioRef.current.ondataavailable = (event) => {
                    setLocalAudioTrack(event.data);
                };

                localAudioRef.current.start();
            })
            .catch((error) => {
                console.error('Error accessing media devices.', error);
            });
    }, []);

    const [question, setQuestion] = useState('');

    useEffect(() => {
        let didCancel = false;

        const fetchQuestion = async () => {
            let data = {
                "subject": "Data Structures and Algorithms",
            };
            try {
                const response = await axios.post('http://100.25.45.160:8000/api/v1/interview/generateQuestion', data, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!didCancel) {
                    setQuestion(response.data.data.question);
                }
            } catch (error) {
                if (!didCancel) {
                    console.error('Error fetching question:', error);
                }
            }
        };

        fetchQuestion();

        return () => {
            didCancel = true;
        };
    }, []);


    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="flex w-full">
            <div className="flex flex-col items-center h-screen w-3/4">
                <div className="timer-tab w-full flex justify-between p-4 items-center">
                    <div className="logo mr-4">
                        <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS" className="h-28" />
                    </div>
                    <div className="title-and-name ml-4">
                        <p className="text-2xl font-semibold">Full Stack Interview</p>
                        <p className="text-lg text-gray-600 font-semibold">Shubh Chaturvedi | 2115000976</p>
                    </div>
                    <div className="timer">
                        <Timer />
                    </div>
                </div>
                <div className="quesion-and-action w-full mt-8">
                    <div className="w-2/3 mx-auto h-[36rem] flex flex-col justify-between">
                        <div className="question bg-gray-200 rounded-lg text-justify">
                            <p className="text-lg font-semibold p-8 h-fit max-h-[40vh]">
                                {question}
                            </p>
                        </div>
                        <div className="audio-visualizer mt-4 flex justify-center">
                            <div className="audio-visualizer">
                                <canvas ref={canvasRef} width="640" height="200" />
                            </div>
                        </div>
                        <div className="actions w-full flex justify-between mt-4">
                            <Button color="blue" ripple="light" size="lg" className="w-1/3">Skip</Button>
<<<<<<< Updated upstream
                            <Button color={isRecording ? "red" : "blue"} ripple="light" size="lg" className="p-4 rounded-full" onClick={isRecording ? "" : startRecording} title='Tap to Speak'>
=======
                            <Button color={isRecording? "red":"blue"} ripple="light" size="lg" className="p-4 rounded-full" onClick={isRecording ? stopRecording : startRecording} title='Tap to Speak'>
>>>>>>> Stashed changes
                                {isRecording ? <StopIcon /> : <MicIcon />}
                            </Button>
                            <Button color="blue" ripple="light" size="lg" className="w-1/3"
                                disabled={!isRecording}
                                onClick={isRecording && stopRecording && handleSaveRecording}
                            >Next</Button>
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
                            <span className="text-lg bg-blue-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">10</span>
                        </div>
                        <div className="flex justify-between w-full mt-2">
                            <p className="text-lg">Total Skipped</p>
                            <span className="text-lg bg-gray-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">0</span>
                        </div>
                        <div className="flex justify-between w-full mt-2">
                            <p className="text-lg">Total Answered</p>
                            <span className="text-lg bg-green-700 text-white inline-block w-8 h-8 p-1 rounded-full text-center">0</span>
                        </div>
                        <div className="flex justify-between w-full mt-2">
                            <p className="text-lg">Total Left</p>
                            <span className="text-lg bg-red-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">10</span>
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
    );
};

export default LiveInterview;
