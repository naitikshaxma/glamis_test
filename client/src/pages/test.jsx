import React, { useEffect, useState, useRef } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';

const Visualizer = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioData, setAudioData] = useState(null);
    const localAudioRef = useRef(null);

    useEffect(() => {
        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorderInstance = new MediaRecorder(stream);
                setMediaRecorder(mediaRecorderInstance);

                if (localAudioRef.current) {
                    localAudioRef.current.srcObject = stream;
                }

                mediaRecorderInstance.ondataavailable = (event) => {
                    setAudioData(event.data);
                };

                mediaRecorderInstance.start();
            } catch (error) {
                console.error('Error accessing media devices.', error);
            }
        };

        initializeMedia();

        return () => {
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
        };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <div>
            <audio ref={localAudioRef} style={{ display: 'none' }} controls />
            {audioData && (
                <LiveAudioVisualizer
                    audioData={audioData}
                    width={200}
                    height={75}
                />
            )}
        </div>
    );
};

export default Visualizer;
