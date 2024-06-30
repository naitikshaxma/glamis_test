import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { AudioVisualizer } from 'react-audio-visualize';
import Visualizer from './test';
import Watermark from '../components/global_components/Watermark';
import MicIcon from '@mui/icons-material/Mic';

// audio visualizer component
const AudioVisualizerComponent = (props) => {
    return (
        <>
            <AudioVisualizer
                ref={props.localAudioRef}
                width={500}
                height={75}
                barWidth={1}
                gap={0}
                barColor={'#f76565'}
            />
        </>
    )
}

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
    const question = "What is React? Explain the features of React. What is JSX? Explain the difference between Real DOM and Virtual DOM. What is the significance of keys in React Explain the features of React. What is JSX?";

    // use live video stream
    const localVideoRef = useRef();
    const [localVideoTrack, setLocalVideoTrack] = useState('');
    const [localAudioTrack, setLocalAudioTrack] = useState('');
    const localAudioRef = useRef();


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

    useEffect(() => {
        const fetchQuestion = async () => {
            
        }
        
        fetchQuestion()
    })

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="flex w-full">

            <div className="flex flex-col items-center h-screen w-3/4">
                {/* <Watermark text="Interviewer" /> */}
                <div className="timer-tab w-full flex justify-between p-4 items-center">
                    {/* <div className="flex items-center"> */}
                    <div className="logo mr-4">
                        <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS" className="h-28" />
                    </div>
                    <div className="title-and-name ml-4">
                        <p className="text-2xl font-semibold">Full Stack Interview</p>
                        <p className="text-lg text-gray-600 font-semibold">Shubh Chaturvedi | 2115000976</p>
                    </div>
                    {/* </div> */}
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
                        <div className="actions w-full flex justify-between">
                            <Button color="blue" ripple="light" size="lg" className="w-1/3">Skip</Button>
                            <Button color="blue" ripple="light" size="lg" className="p-4 rounded-full"><MicIcon /></Button>
                            <Button color="blue" ripple="light" size="lg" className="w-1/3" disabled>Next</Button>
                        </div>
                    </div>

                </div>
                {/* 3 buttons one to skip the question , tap to speak ,and last is to go on next answer */}
            </div>
            <div className="flex flex-col w-1/4 h-screen bg-blue-gray-100 bg-opacity-50 items-center">
                <div className="flex justify-center w-[25rem] m-3">
                    <video ref={localVideoRef} autoPlay muted className="rounded-lg h-[15rem]"></video>
                    {/* <audio ref={localVideoRef} autoPlay className="rounded-lg h-[16rem]"></audio> */}
                </div>
                {/* a div that showes Total question asked , total skiped, total asnwered, total left and many more */}

                <div className="flex flex-col items-center w-full p-4">
                    <p className="text-lg font-semibold">Interview Summary</p>
                    <div className="flex flex-col items-center w-full mt-4">
                        <div className="flex justify-between w-full">
                            <p className="text-lg">Total Questions</p>
                            <span className="text-lg bg-blue-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">5</span>
                        </div>
                        <div className="flex justify-between w-full mt-2">
                            <p className="text-lg">Total Skipped</p>
                            <span className="text-lg bg-gray-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">2</span>
                        </div>
                        <div className="flex justify-between w-full mt-2">
                            <p className="text-lg">Total Answered</p>
                            <span className="text-lg bg-green-700 text-white inline-block w-8 h-8 p-1 rounded-full text-center">2</span>
                        </div>
                        <div className="flex justify-between w-full mt-2">
                            <p className="text-lg">Total Left</p>
                            <span className="text-lg bg-red-500 text-white inline-block w-8 h-8 p-1 rounded-full text-center">1</span>
                        </div>
                    </div>
                </div>
                {/* a button of end interview at the bottom-end */}
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