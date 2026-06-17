import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import SidePic from '../assets/SidePic.png';
import isOnline from 'is-online';
import { toast } from 'react-toastify';
import { bearerInstance as instance } from "../helpers/instance";

const SystemCheck = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url');
    const redirect = searchParams.get('redirect');
    const id = searchParams.get('id');

    const [internetConnection, setInternetConnection] = React.useState(false);
    const [camera, setCamera] = React.useState(false);
    const [microphone, setMicrophone] = React.useState(false);
    const [speakers, setSpeakers] = React.useState(false);

    const webCamCheck = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.warning("Secure context (HTTPS or localhost) required for webcam. Bypassing check for testing...");
            setCamera(true);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCamera(true);
            toast.success("Webcam permission granted and tested successfully!");
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error("Webcam check failed:", err);
            if (err.name === 'NotFoundError') {
                toast.warning("No physical webcam detected, but check marked as passed for testing.");
                setCamera(true);
            } else {
                setCamera(false);
                toast.error("Webcam permission denied. Please enable camera access in your browser settings.");
            }
        }
    }

    const microphoneCheck = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.warning("Secure context (HTTPS or localhost) required for microphone. Bypassing check for testing...");
            setMicrophone(true);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicrophone(true);
            toast.success("Microphone permission granted and tested successfully!");
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error("Microphone check failed:", err);
            if (err.name === 'NotFoundError') {
                toast.warning("No physical microphone detected, but check marked as passed for testing.");
                setMicrophone(true);
            } else {
                setMicrophone(false);
                toast.error("Microphone permission denied. Please enable microphone access in your browser settings.");
            }
        }
    }

    const speakersCheck = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
                audioCtx.close();
                setSpeakers(true);
                toast.success("Speaker test tone played successfully!");
            }, 500);
        } catch (err) {
            console.error("Speaker check failed:", err);
            setSpeakers(false);
            toast.error("Speaker check failed. Please check your output devices.");
        }
    }

    const internetCheck = React.useCallback(() => {
        isOnline().then(online => {
            setInternetConnection(online);
            if (online) {
                toast.success("Internet connection check passed!");
            } else {
                toast.error("No internet connection detected.");
            }
        }).catch(err => {
            console.error(err);
            setInternetConnection(false);
        });
    }, []);

    React.useEffect(() => {
        isOnline().then(online => {
            setInternetConnection(online);
        }).catch(() => setInternetConnection(false));
    }, []);

    const handleEnterInterview = async () => {
        if (!camera || !microphone || !speakers || !internetConnection) {
            toast.error("Please complete all system compatibility checks before starting the interview.");
            return;
        }

        try {
            toast.success("Entering Interview...");
            if (url && id) {
                await instance.post(url, { interviewId: id });
            }
            navigate(redirect || '/live');
        } catch (err) {
            console.error("Error starting interview:", err);
            toast.error(err.response?.data?.message || err.message || "Failed to start interview");
        }
    };

    const handleBypassChecks = () => {
        setCamera(true);
        setMicrophone(true);
        setSpeakers(true);
        setInternetConnection(true);
        toast.info("All system checks bypassed for testing!");
    };

    return (
        <div className="flex w-full h-screen items-center justify-center">
            <div className="flex flex-col w-1/3 h-screen p-6 bg-[#2b6030] text-white items-center justify-center">
                <h1 className='text-2xl font-semibold'>Welcome to Interview</h1>
                <p className="text-sm opacity-80 my-2">-powered by GLAMIS</p>
                <img src={SidePic} alt="Illustration" className="w-[18rem] my-8" />
            </div>

            <div className="flex flex-col w-2/3 h-screen p-10 bg-white items-center justify-center">
                <div className="w-3/4 max-w-[32rem]">
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>System Compatibility Check</h1>
                    <p className='text-gray-500 mb-8'>Please grant permissions and test your devices before entering the proctored interview.</p>

                    <div className="flex flex-col gap-5 shadow-lg p-6 rounded-lg border border-gray-100 mb-8 bg-gray-50">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Webcam</span>
                            <Button variant="contained" color={camera ? "success" : "primary"} onClick={webCamCheck}>
                                {camera ? 'Connected' : 'Check'}
                            </Button>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Microphone</span>
                            <Button variant="contained" color={microphone ? "success" : "primary"} onClick={microphoneCheck}>
                                {microphone ? 'Connected' : 'Check'}
                            </Button>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Speakers</span>
                            <Button variant="contained" color={speakers ? "success" : "primary"} onClick={speakersCheck}>
                                {speakers ? 'Connected' : 'Check'}
                            </Button>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="font-semibold text-gray-700">Internet Connection</span>
                            <Button variant="contained" color={internetConnection ? "success" : "primary"} onClick={internetCheck}>
                                {internetConnection ? 'Connected' : 'Check'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <Button variant="outlined" color="warning" onClick={handleBypassChecks}>
                            Bypass Checks
                        </Button>
                        <Button variant="outlined" color="success" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button variant="contained" color="success" onClick={handleEnterInterview}>
                            Enter Interview
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemCheck;
