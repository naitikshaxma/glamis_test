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
    const question = "What is React? Explain the features of React. What is JSX? Explain the difference between Real DOM and Virtual DOM. What is the significance of keys in React";

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

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="flex w-full">

            <div className="flex flex-col items-center h-screen w-3/4">
                {/* <Watermark text="Interviewer" /> */}
                <div className="flex justify-between items-center w-full p-4">
                    <div className='w-2/12 flex items-center justify-center'>
                        {/* <Timer /> */}

                        <img src="https://www.gla.ac.in/info/common/images/mobilelogo.png" alt="GLAMIS" className="h-24 mb-7" />
                    </div>
                    <div className="w-10/12 ml-20">
                        <p className="text-lg font-semibold">React.js Developer Interview
                            <span className="block text-sm font-normal">Gourav Bathla - 2115000976</span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center w-full my-4">
                    <div className="w-8/12 p-4 rounded-lg bg-opacity-50 bg-gray-300 h-80">
                        <p className="text-lg font-semibold">Question 1 : {question}</p>
                    </div>
                </div>
                {/* 3 buttons one to skip the question , tap to speak ,and last is to go on next answer */}
                <div className="flex justify-center w-full mt-auto p-4">
                    <div className="w-2/12 flex">

                        <Timer />
                    </div>
                    <div className="w-10/12 flex">
                        
                        <div className="flex justify-center space-x-28">
                            <Button variant='filled' color='blue' size='md' className="w-44">Skip</Button>
                            <Button variant='filled' color='blue' size='lg' className="w-fit rounded-full p-4">
                                <MicIcon />
                            </Button>
                            <Button variant='filled' color='blue' size='md' className="w-44" disabled>Next </Button>
                        </div>
                    </div>
                    
                </div>
                {/* <div className="flex items-center justify-between w-full mt-auto p-4">
                    <AudioVisualizerComponent localAudioRef={localAudioRef} />
                    <div className="flex justify-center space-x-4 mt-[12rem]">
                        <Button variant='filled' color='blue' size='lg' className="w-44">Skip</Button>
                        <Button variant='outlined' color='blue' size='lg' className="w-44">Next</Button>
                    </div>
                </div> */}
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
