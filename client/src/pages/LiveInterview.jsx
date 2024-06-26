import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

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

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="flex flex-col items-center h-screen bg-gray-900 text-white">
            <div className="flex justify-between items-center w-full p-4">
                <div className='w-1/12 flex items-center justify-center'>
                    <Timer />
                </div>
                <div className="w-9/12 ml-20">
                    <p className="text-lg font-semibold">React.js Developer Interview
                        <span className="block text-sm font-normal">Gourav Bathla - 2115000976</span>
                    </p>
                </div>
                <Button
                    variant='filled'
                    className='w-2/12'
                    color='red'
                    size='lg'
                    onClick={handleClose}
                >
                    End Interview
                </Button>
            </div>
            <div className="flex flex-col items-center w-full my-4">
                <div className="w-8/12 p-4 rounded-lg bg-opacity-50 bg-gray-800 h-80">
                    <p className="text-lg font-semibold">Question 1 : {question}</p>
                </div>
            </div>
            <div className="flex items-center justify-between w-full mt-auto p-4">
                <div className="flex justify-center w-[25rem]">
                    <video ref={localVideoRef} autoPlay muted className="rounded-lg h-[16rem]"></video>
                </div>
                <div className="flex justify-center space-x-4 mt-[12rem]">
                    <Button variant='filled' color='blue' size='lg' className="w-44">Skip</Button>
                    <Button variant='outlined' color='blue' size='lg' className="w-44">Next</Button>
                </div>
            </div>
        </div>
    );
};

export default LiveInterview;
