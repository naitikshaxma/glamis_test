import React from 'react'
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SidePic from '../assets/SidePic.png';
import JDpic from '../assets/jd.png';
import Resume from '../assets/sample.pdf';
import { useNavigate } from 'react-router-dom';
import isOnline from 'is-online';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';


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


    const CreateInterview = async () => {
        try {
            if (interviewType === 'JD') {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/createInterviewByJD`, {
                    company: selectedCompany,
                    jobTitle: selectedJobTitle,
                },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Cookies.get('accessToken')}`
                        }
                    });
                console.log(response.data);
                if (response.data.statusCode === 200) {
                    Cookies.set('interviewId', response.data.data._id);
                    Cookies.set('selectedCompany', selectedCompany);
                    Cookies.set('jobTitle', selectedJobTitle);
                    Cookies.set('mockType', 'student-company');
                    Cookies.set('delta', 10);
                    Cookies.set('currentQuestion', 0);
                    navigate('/live');
                    console.log(company);
                    console.log(jobTitle)
                }
            } else if (interviewType === 'Core Subjects') {
                // create interview
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/createInterview`, {
                    subject: subject,
                },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Cookies.get('accessToken')}`
                        }
                    }
                )
                console.log(response.data);
                if (response.data.statusCode === 200) {
                    Cookies.set('interviewId', response.data.data._id);
                    Cookies.set('subject', subject);
                    Cookies.set('mockType', 'student-subject');
                    Cookies.set('delta', 10);
                    Cookies.set('currentQuestion', 0);
                    navigate('/live');
                }
            } else if (interviewType === 'Written') {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/createInterview`, {
                    subject: topic,
                },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Cookies.get('accessToken')}`
                        }
                    }
                )
                console.log(response.data);
                if (response.data.statusCode === 200) {
                    Cookies.set('interviewId', response.data.data._id);
                    Cookies.set('subject', topic);
                    Cookies.set('mockType', 'student-written');
                    Cookies.set('delta', 10);
                    Cookies.set('currentQuestion', 0);
                    navigate('/written');
                }
            } else if (interviewType === 'Resume') {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/createInterview`, {
                    subject: "Interview by Resume",
                },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Cookies.get('accessToken')}`
                        }
                    }
                )
                console.log(response.data);
                if (response.data.statusCode === 200) {
                    Cookies.set('interviewId', response.data.data._id);
                    Cookies.set('subject', 'Interview by Resume');
                    localStorage.setItem('resumeText', resumeText);
                    Cookies.set('mockType', 'student-resume');
                    Cookies.set('delta', 10);
                    Cookies.set('currentQuestion', 0);
                    navigate('/live');
                }
            }
        } catch (error) {
            console.error("Failed to create interview:", error);
            const errMsg = error.response?.data?.message || "Failed to initiate interview";
            toast.error(errMsg);
        }
    }

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

                                    <img src={JDpic} className='w-full' />
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

                                    <img src={JDpic} className='w-full' />
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
                                }}>
                                <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom className="font-semibold">
                                    Writing Skills Practice
                                </Typography>
                                <div className="flex w-24 h-24 m-5 items-center justify-center">

                                    <img src={JDpic} className='w-full' />
                                </div>
                                <Typography variant="body2">
                                    this module will test your written english abilities
                                </Typography>
                            </CardContent>

                        </div>}


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
                        <Button variant="outlined" color="success" onClick={handleBack}>
                            Back
                        </Button>
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
                                    toast.success('Interview Created Successfully');
                                    CreateInterview();
                                }}>
                                Start Interview
                            </Button>
                        }
                    </div>

                </div>
            </div>
        </div>
    )
}
/*hi*/