import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Flagged (not aborting) violations recorded during the pre-interview flow.
const FLAG_KEY = 'glamisPreInterviewFlags';

const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

const requestFullscreen = () => {
    const el = document.documentElement;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (fn) return fn.call(el);
    return Promise.reject(new Error('Fullscreen API not supported'));
};

/**
 * Wraps a screen in the proctored, fullscreen-locked pre-interview flow.
 * - If fullscreen is lost or was never granted, a BLOCKING overlay covers the
 *   screen with an "Enter Fullscreen" button (requestFullscreen needs a user
 *   gesture, so it can only be re-entered via the click).
 * - Tab/window switches are counted + toasted (flagged), but never abort — the
 *   interview hasn't started yet.
 * The children stay mounted underneath so no state is lost on re-prompt.
 */
export default function FullscreenGuard({
    children,
    title = 'Fullscreen required',
    message = 'You are in a proctored interview session. Return to fullscreen to continue.',
}) {
    const [fullscreen, setFullscreen] = useState(isFullscreen());

    // Track fullscreen state.
    useEffect(() => {
        const onChange = () => setFullscreen(isFullscreen());
        document.addEventListener('fullscreenchange', onChange);
        document.addEventListener('webkitfullscreenchange', onChange);
        setFullscreen(isFullscreen()); // sync on mount
        return () => {
            document.removeEventListener('fullscreenchange', onChange);
            document.removeEventListener('webkitfullscreenchange', onChange);
        };
    }, []);

    // Flag tab/window switches — record + warn, do not abort.
    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') {
                const count = (parseInt(sessionStorage.getItem(FLAG_KEY), 10) || 0) + 1;
                sessionStorage.setItem(FLAG_KEY, String(count));
                toast.warn(`Leaving the interview window is recorded (flag #${count}).`);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    const enterFullscreen = useCallback(() => {
        requestFullscreen().catch((err) => {
            console.error('Failed to enter fullscreen:', err);
            toast.error('Could not enter fullscreen. Please allow fullscreen for this site and try again.');
        });
    }, []);

    return (
        <>
            {children}
            {!fullscreen && (
                <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
                        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#2b6030]/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#2b6030" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <button
                            onClick={enterFullscreen}
                            className="w-full bg-[#2b6030] hover:bg-[#1c3d1f] text-white font-semibold py-3 rounded-lg transition-colors focus:outline-none"
                        >
                            Enter Fullscreen
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
