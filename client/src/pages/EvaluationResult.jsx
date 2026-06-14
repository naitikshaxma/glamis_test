import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const EvaluationResult = ({ data }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('saving'); // 'saving', 'success', 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [countdown, setCountdown] = useState(10);
    const [savedInterviewId, setSavedInterviewId] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const saveResultToDB = async () => {
            try {
                console.log(data);
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/saveResultToDb`, { data, interviewId: Cookies.get('interviewId') }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Cookies.get('accessToken')}`
                    }
                });
                console.log(response.data);
                if (isMounted) {
                    setStatus('success');
                    // Store the interview ID from backend response if available
                    if (response.data?.data?.interviewId) {
                        setSavedInterviewId(response.data.data.interviewId);
                    }
                }
            } catch (error) {
                console.error('Error saving result:', error);
                if (isMounted) {
                    setStatus('error');
                    setErrorMsg(error?.response?.data?.message || error.message || 'Failed to save results');
                }
            }
        };

        saveResultToDB();
        return () => { isMounted = false; };
    }, []); // Fix: add empty dependency array to prevent infinite loop

    // Countdown timer that navigates after 10 seconds
    useEffect(() => {
        window.interviewCompleted = true;
        if (status !== 'saving') {
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // Exit fullscreen gracefully before navigating
                        if (document.fullscreenElement) {
                            document.exitFullscreen().catch(() => {});
                        }
                        // Clean up interview cookies
                        Cookies.remove('interviewId');
                        Cookies.remove('subject');
                        Cookies.remove('currentQuestion');
                        // Auto-redirect to feedback after timeout
                        navigate('/feedback');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    const handleViewReport = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        
        // Priority 1: Backend response ID, Priority 2: Cookie ID
        const finalInterviewId = savedInterviewId || Cookies.get('interviewId');
        
        Cookies.remove('interviewId');
        Cookies.remove('subject');
        Cookies.remove('currentQuestion');
        
        if (finalInterviewId) {
            navigate(`/history/detailed/${finalInterviewId}`);
        } else {
            navigate('/history'); // Fallback if no ID is found
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="text-6xl mb-4">
                    {status === 'saving' ? '⏳' : status === 'success' ? '✅' : '⚠️'}
                </div>
                <Typography variant="h4" color="blue-gray" className="mb-4">
                    {status === 'saving' ? 'Saving Your Results...' : status === 'success' ? 'Interview Complete!' : 'Results Saved With Errors'}
                </Typography>
                <Typography variant="paragraph" color="gray" className="mb-4">
                    {status === 'saving' 
                        ? 'Please wait while we save your interview results.' 
                        : status === 'success' 
                            ? 'Your results have been saved successfully. You can view your detailed report in the History page.'
                            : `There was an issue: ${errorMsg}. Your results may still be available in the History page.`}
                </Typography>
                {status !== 'saving' && (
                    <div className="mt-4">
                        <Typography variant="small" color="gray">
                            Redirecting to feedback form in <span className="font-bold text-blue-500 text-lg">{countdown}</span> seconds...
                        </Typography>
                        <button
                            onClick={handleViewReport}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            View Report
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluationResult;
