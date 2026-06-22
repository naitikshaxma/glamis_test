import React from 'react'
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import SidePic from '../assets/SidePic.png';
import JDpic from '../assets/jd.png';
import JDInterviewPic from '../assets/interview_by_jd.png';
import CoreSubjectsPic from '../assets/interview_by_core_subjects.png';
import WritingSkillsPic from '../assets/writing_skills_practice.png';
import Resume from '../assets/sample.pdf';
import { useNavigate } from 'react-router-dom';
import isOnline from 'is-online';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { setPendingInterview } from '../helpers/interviewSession';

// Standalone real-time Avatar Interview studio (Azure TTS avatar + AI agent).
// Override with VITE_AVATAR_URL if it runs elsewhere.
const AVATAR_BASE = import.meta.env.VITE_AVATAR_URL || 'http://localhost:8080';

const steps = [
    'Select type of interview',
    'Provide interview details',
    'System compatibility check'
];

const coreSubjects = [
    "Data Structures and Algorithms",
    "Operating Systems",
    "Computer Networks",
    "Database Management Systems",
    "Machine Learning",
    "Cyber Security",
    "Cloud Computing",
    "Web Development",
    "Java",
    "Python",
    "JavaScript",
    "C/C++",
]

const jobTitles = [
    "Software Engineer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "ML Engineer",
    "AI Engineer",
]

const companies = [
    "Accenture",
    "KPIT",
    "Gemini Solutions",
    "Capgemini"
]

const topicsList = [
    "Sports",
    "Video Games",
    "Politics"
]

export default function CreateInterview() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = React.useState(0);
    const [avatarMode, setAvatarMode] = React.useState(false);
    const handleNext = () => {
        // check if any thing is selected
        if (activeStep === 0) {
            if (!(interviewType === 'Resume' || interviewType === 'JD' || interviewType === 'Core Subjects' || interviewType === 'Written')) {
                toast.warning('Please select the type of interview');
                return;
            }
        }
        else if (activeStep === 1 && interviewType === 'JD' && !(selectedCompany && selectedJobTitle)) {
            toast.warning('Please select the company and job title');
            return;
        }
        else if (activeStep === 1 && interviewType === 'Core Subjects' && !subject) {
            toast.warning('Please select the core subject');
            return;
        }
        else if (activeStep === 1 && interviewType === 'Resume' && !resumeText) {
            toast.warning('Please load or enter your resume text');
            return;
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    const [internetConnection, setInternetConnection] = React.useState(false);

    const [camera, setCamera] = React.useState(false);
    const [microphone, setMicrophone] = React.useState(false);
    const [speakers, setSpeakers] = React.useState(false);

    const webCamCheck = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCamera(true);
            toast.success("Webcam permission granted and tested successfully!");
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error("Webcam check failed:", err);
            setCamera(false);
            toast.error("Webcam permission denied or not found. Please enable camera access.");
        }
    }

    const microphoneCheck = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicrophone(true);
            toast.success("Microphone permission granted and tested successfully!");
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            console.error("Microphone check failed:", err);
            setMicrophone(false);
            toast.error("Microphone permission denied or not found. Please enable microphone access.");
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
        if (activeStep === 2) {
            isOnline().then(online => {
                setInternetConnection(online);
            }).catch(() => setInternetConnection(false));
        }
    }, [activeStep]);
    const [interviewType, setInterviewType] = React.useState('');
    const [subject, setSubject] = React.useState('');
    const [topic, setTopic] = React.useState('');

    const [selectedCompany, setSelectedCompany] = React.useState('');
    const [selectedJobTitle, setSelectedJobTitle] = React.useState('');

    const [resumeText, setResumeText] = React.useState('');
    const [loadingResume, setLoadingResume] = React.useState(false);

    const handleLoadSavedResume = async () => {
        setLoadingResume(true);
        try {
            const token = Cookies.get('accessToken');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/parse-saved-resume`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.data.statusCode === 200) {
                setResumeText(response.data.data.text);
                toast.success("Saved resume loaded and parsed successfully!");
            }
        } catch (error) {
            console.error("Failed to load saved resume:", error);
            const errMsg = error.response?.data?.message || "Failed to load/parse saved resume. Please check if you uploaded it in your profile.";
            toast.error(errMsg);
        } finally {
            setLoadingResume(false);
        }
    }

    const handleUploadNewResume = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setLoadingResume(true);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const token = Cookies.get('accessToken');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/parse-pdf`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.data.statusCode === 200) {
                setResumeText(response.data.data.text);
                toast.success("Resume file uploaded and parsed successfully!");
            }
        } catch (error) {
            console.error("Failed to upload and parse resume:", error);
            const errMsg = error.response?.data?.message || "Failed to parse uploaded PDF file";
            toast.error(errMsg);
        } finally {
            setLoadingResume(false);
        }
    }


    // The self-serve create logic now lives in launchInterviewSession()
    // (helpers/interviewSession.js) and runs only at the final Start on the
    // review screen — see the pre-interview lobby/review flow.

    // Map the selected GLAMIS interview type/details to the avatar studio's
    // agent params. The avatar now runs natively at /live (no separate app), so
    // we just compute the params to carry through the schedule flow.
    const avatarParams = () => {
        let type = 'technical';
        let role = 'the role';
        if (interviewType === 'JD') {
            type = 'technical';
            role = [selectedJobTitle, selectedCompany].filter(Boolean).join(' at ') || 'the role';
        } else if (interviewType === 'Core Subjects') {
            type = /data structures|algorithm/i.test(subject) ? 'dsa' : 'technical';
            role = subject || 'the role';
        } else if (interviewType === 'Written') {
            type = 'verbal';
            role = topic || 'Communication';
        } else if (interviewType === 'Resume') {
            type = 'behavioral';
            role = 'the role';
        }
        return { type, role, difficulty: 'medium', count: 5 };
    };

    return (
        <div className="flex w-full h-screen items-center justify-center">
            <div className="flex flex-col w-1/3 h-screen p-6 bg-[#2b6030] text-white items-center justify-center">

                <h1 className='text-2xl font-semibold'>Welcome to Interview</h1>
                <div className="flex justify-end">

                    <p className='text-sm'>-powered by GLAMIS</p>
                </div>

                <img src={SidePic} className='mt-10 p-20' />
            </div>
            <div className="flex flex-col w-2/3 h-screen p-6 bg-white">
                {/* create 3 steps bar for create an interview */}
                <div className='flex flex-col w-full justify-between'>
                    <h1 className='text-2xl font-semibold my-5'>Create a Interview</h1>
                    {/* horizontal bars */}
                    <Box sx={{ width: '100%' }} className="my-5">
                        <Stepper activeStep={1} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    {/* 3 boxes */}
                    {/* interview by jd, interview by resume, interview by core subjects */}



                    {
                        activeStep === 0 &&
                        <>
                        <div className="flex justify-between gap-5 my-5">
                            <CardContent className={` w-1/4 p-6
                        ${interviewType === 'JD' ? 'bg-gray-100' : ''}
                        rounded-lg shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform transform duration-300`}
                                onClick={() => {
                                    setInterviewType('JD');

                                }}>

                                <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom className="font-semibold">
                                    Interview by JD
                                </Typography>
                                <div className="flex w-24 h-24 m-5 items-center justify-center">

                                    <img src={JDInterviewPic} alt="Interview by JD" className='w-full' />
                                </div>
                                <Typography variant="body2" className="text-center">
                                    provide the job description and the system will generate the interview questions
                                </Typography>
                            </CardContent>

                            <CardContent className={
                                `w-1/4 p-6
                            ${interviewType === 'Resume' ? 'bg-gray-100' : ''}
                            rounded-lg shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform transform duration-300`}
                                onClick={() => {
                                    setInterviewType('Resume');
                                }}>

                                <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom className="font-semibold">
                                    Interview by Resume
                                </Typography>
                                <div className="flex w-24 h-24 m-5 items-center justify-center">

                                    <img src={JDpic} className='w-full' />
                                </div>
                                <Typography variant="body2">
                                    provide the resume and the system will generate the interview questions
                                </Typography>


                            </CardContent>


                            <CardContent className={
                                `w-1/4 p-6
                            ${interviewType === 'Core Subjects' ? 'bg-gray-100' : ''}
                            rounded-lg shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform
                            transform
                            duration-300`}
                                onClick={() => {
                                    setInterviewType('Core Subjects');
                                }}>
                                <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom className="font-semibold">
                                    Interview by Core Subjects
                                </Typography>
                                <div className="flex w-24 h-24 m-5 items-center justify-center">

                                    <img src={CoreSubjectsPic} alt="Interview by Core Subjects" className='w-full' />
                                </div>
                                <Typography variant="body2">
                                    provide the core subjects and the system will generate the interview questions
                                </Typography>
                            </CardContent>

                            <CardContent className={
                                `w-1/4 p-6
                            ${interviewType === 'Written' ? 'bg-gray-100' : ''}
                            rounded-lg shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform
                            transform
                            duration-300`}
                                onClick={() => {
                                    setInterviewType('Written');
                                    setAvatarMode(false); // avatar interview is spoken; not applicable to writing practice
                                }}>
                                <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom className="font-semibold">
                                    Writing Skills Practice
                                </Typography>
                                <div className="flex w-24 h-24 m-5 items-center justify-center">

                                    <img src={WritingSkillsPic} alt="Writing Skills Practice" className='w-full' />
                                </div>
                                <Typography variant="body2">
                                    this module will test your written english abilities
                                </Typography>
                            </CardContent>

                        </div>

                        {/* Real-time Avatar Interview toggle — disabled for Writing Skills Practice (spoken avatar doesn't apply) */}
                        {(() => {
                            const avatarLocked = interviewType === 'Written';
                            return (
                                <div className={`flex items-center justify-between gap-4 my-3 p-4 rounded-lg border transition-colors
                                    ${avatarLocked ? 'border-gray-200 bg-gray-100 opacity-60'
                                        : avatarMode ? 'border-[#2b6030] bg-[#2b6030]/5' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <i className='bx bx-user-voice text-[#2b6030] text-xl'></i>
                                            <span className="font-semibold text-gray-800">Real-time Avatar Interview</span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {avatarLocked
                                                ? 'Not available for Writing Skills Practice — this is a typed exercise, not a spoken interview.'
                                                : 'A live AI avatar speaks each question aloud and listens to your spoken answers, then gives a scored report. Opens the full-screen avatar studio.'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={avatarMode && !avatarLocked}
                                        onChange={(e) => setAvatarMode(e.target.checked)}
                                        color="success"
                                        disabled={avatarLocked}
                                        inputProps={{ 'aria-label': 'Enable real-time avatar interview' }}
                                    />
                                </div>
                            );
                        })()}
                        </>}


                    {/* for jd take a job title expreience level hardness and jd */}

                    <div className="flex flex-col gap-5 my-5">
                        {activeStep === 1 && interviewType === 'JD' && <div>
                            <h1 className='text-2xl font-semibold'>Provide Interview Details</h1>
                            <div className="flex flex-col gap-5 my-5">

                                <div className="flex gap-5">
                                    <select
                                        className="p-3 border border-gray-300 rounded-lg w-1/2"
                                        onChange={(e) => setSelectedCompany(e.target.value)}
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((title) => (
                                            <option key={title} value={title}>{title}</option>
                                        ))}
                                    </select>

                                    <select
                                        className="p-3 border border-gray-300 rounded-lg w-1/2"
                                        onChange={(e) => setSelectedJobTitle(e.target.value)}
                                    >
                                        <option value="">Select Job Title</option>
                                        {jobTitles.map((title) => (
                                            <option key={title} value={title}>{title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>}
                        {activeStep === 1 && interviewType === 'Resume' && <div>
                            <h1 className='text-2xl font-bold text-gray-800 mb-2'>Provide Interview Details</h1>
                            <p className='text-sm text-gray-500 mb-6'>Load your saved resume or upload a new PDF to extract skills and projects for the AI interviewer.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-5">
                                {/* Options Card */}
                                <div className="flex flex-col gap-6 p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-lg font-semibold text-gray-800 text-left">Option 1: Use Saved Resume</h2>
                                        <p className="text-xs text-gray-500 text-left">Quickly fetch and parse the PDF resume saved on your profile.</p>
                                        <Button 
                                            variant="contained"
                                            onClick={handleLoadSavedResume}
                                            disabled={loadingResume}
                                            color="success"
                                            className="w-full py-3 mt-2 font-medium capitalize"
                                        >
                                            {loadingResume ? 'Parsing...' : 'Load Profile Resume'}
                                        </Button>
                                    </div>
                                    
                                    <div className="h-px bg-gray-200 my-2"></div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-lg font-semibold text-gray-800 text-left">Option 2: Upload New PDF</h2>
                                        <p className="text-xs text-gray-500 text-left">Select any standard PDF resume to upload and parse temporarily.</p>
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-success-dark transition-colors cursor-pointer relative bg-gray-50">
                                            <input 
                                                type="file" 
                                                accept="application/pdf"
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                onChange={handleUploadNewResume}
                                                disabled={loadingResume}
                                            />
                                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                            <span className="text-sm font-medium text-gray-600">
                                                {loadingResume ? 'Extracting text...' : 'Click to upload PDF'}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1">PDF up to 5MB</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Card */}
                                <div className="flex flex-col p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-lg font-semibold text-gray-800">Extracted Content Preview</h2>
                                        {resumeText && (
                                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">
                                                Ready
                                            </span>
                                        )}
                                    </div>
                                    <textarea 
                                        placeholder="Extracted resume text will appear here. You can also edit it manually to add/change details before starting..." 
                                        className="p-4 border border-gray-300 rounded-xl h-64 focus:outline-none focus:ring-2 focus:ring-[#2b6030] text-sm text-gray-700 leading-relaxed resize-none w-full"
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        disabled={loadingResume}
                                    />
                                    <p className="text-xs text-gray-400 mt-2 text-left">Feel free to review and tweak the text. The AI uses this description directly to construct the interview questions.</p>
                                </div>
                            </div>
                        </div>}
                        {activeStep === 1 && interviewType === 'Core Subjects' && <div>
                            <h1 className='text-2xl font-semibold'>Provide Interview Details</h1>
                            <div className="flex flex-col gap-5 my-5">
                                <div className="flex gap-5 w-1/2">
                                    <select
                                        className="p-3 border border-gray-300 rounded-lg w-1/2"
                                        onChange={(e) => {
                                            const selectedSubject = e.target.value;
                                            console.log(selectedSubject);
                                            setSubject(selectedSubject);
                                        }}
                                    >
                                        <option value="">Select Core Subjects</option>
                                        {coreSubjects.map((subject) => (
                                            <option key={subject} value={subject}>
                                                {subject}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>}
                        {activeStep === 1 && interviewType === 'Written' && <div>
                            <h1 className='text-2xl font-semibold'>Provide Interview Details</h1>
                            <div className="flex flex-col gap-5 my-5">
                                <div className="flex gap-5 w-1/2">
                                    <select
                                        className="p-3 border border-gray-300 rounded-lg w-1/2"
                                        onChange={(e) => {
                                            const selectedTopic = e.target.value;
                                            console.log(selectedTopic);
                                            setTopic(selectedTopic);
                                        }}
                                    >
                                        <option value="">Select Your Preferred Topic</option>
                                        {topicsList.map((topic) => (
                                            <option key={topic} value={topic}>
                                                {topic}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>}
                    </div>


                    {/* system compatibility check */}

                    <div className="flex flex-col gap-5 my-5">

                        {activeStep === 2 && <div>
                            <h1 className='text-2xl font-semibold'>System Compatibility Check</h1>
                            <div className="flex flex-col gap-5 m-5 shadow-lg p-5 rounded-lg">
                                <div className="flex gap-5">
                                    <p className="w-1/2">Webcam</p>
                                    <Button variant="contained" color={camera ? "success" : "primary"} onClick={webCamCheck}>
                                        {camera ? 'Connected' : 'Check'}
                                    </Button>
                                </div>
                                <div className="flex gap-5">
                                    <p className="w-1/2">Microphone</p>
                                    <Button variant="contained" color={microphone ? "success" : "primary"} onClick={microphoneCheck}>
                                        {microphone ? 'Connected' : 'Check'}
                                    </Button>
                                </div>
                                <div className="flex gap-5">
                                    <p className="w-1/2">Speakers</p>
                                    <Button variant="contained" color={speakers ? "success" : "primary"} onClick={speakersCheck}>
                                        {speakers ? 'Connected' : 'Check'}
                                    </Button>
                                </div>
                                <div className="flex gap-5">
                                    <p className="w-1/2">Internet Connection</p>
                                    <Button variant="contained" color={internetConnection ? "success" : "primary"}
                                        onClick={internetCheck}
                                    >{
                                            internetConnection ? 'Connected' : 'Check'

                                        }</Button>
                                </div>
                            </div>
                        </div>
                        }
                    </div>



                    {/* 2 buttons flex flex end */}

                    <div className="flex justify-end gap-5 my-5">
                        {activeStep !== 0 &&
                        <Button variant="outlined" color="success" onClick={handleBack}>
                            Back
                        </Button>}
                        {
                            activeStep !== 2 &&
                            <Button variant="contained" color="success"
                                onClick={handleNext}>
                                Next
                            </Button>}

                        {
                            activeStep === 2 &&
                            <Button variant="contained" color="success"
                                onClick={() => {
                                    if (!camera || !microphone || !speakers || !internetConnection) {
                                        toast.error("Please complete all system compatibility checks before entering the interview.");
                                        return;
                                    }
                                    // Defer ALL interview logic to the final Start on the review
                                    // screen. Here we only stash the selection, lock fullscreen
                                    // (this click is the required user gesture), and enter the lobby.
                                    // Avatar mode now runs natively at /live, so it goes through the
                                    // same schedule flow — we just carry the avatar params along.
                                    const config = {
                                        interviewType,
                                        selectedCompany,
                                        selectedJobTitle,
                                        subject,
                                        topic,
                                        resumeText,
                                    };
                                    if (avatarMode) {
                                        config.avatarMode = true;
                                        config.avatar = avatarParams();
                                    }
                                    setPendingInterview(config);
                                    const fsEl = document.documentElement;
                                    const reqFs = fsEl.requestFullscreen || fsEl.webkitRequestFullscreen;
                                    if (reqFs) { try { reqFs.call(fsEl); } catch (e) { /* FullscreenGuard re-prompts */ } }
                                    toast.success(avatarMode
                                        ? 'Avatar interview scheduled — review and start it from the lobby.'
                                        : 'Interview scheduled — review and start it from the lobby.');
                                    navigate('/interview/lobby');
                                }}>
                                {avatarMode ? 'Start Avatar Interview' : 'Schedule Interview'}
                            </Button>
                        }
                    </div>

                </div>
            </div>
        </div>
    )
}
/*hi*/