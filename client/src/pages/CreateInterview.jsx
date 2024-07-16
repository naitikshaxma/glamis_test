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
    "Software Engineering",
    "Computer Organization and Architecture",
    "Theory of Computation",
    "Compiler Design",
    "Computer Graphics",
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Natural Language Processing",
    "Computer Vision",
    "Robotics",
    "Cyber Security",
    "Cloud Computing",
    "Internet of Things",
    "Blockchain",
    "Big Data",
    "Data Science",
    "Data Analytics",
    "Data Mining",
    "Web Development",
    "Mobile Development",
    "Game Development",
    "UI/UX Design",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "DevOps"
]

const jobTitles = [
    "Software Engineer",
    "Data Scientist",
    "Data Analyst",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "QA Engineer",
    "ML Engineer",
    "AI Engineer",
    "Data Engineer",
    "Cloud Engineer",
    "Cyber Security Engineer",
    "Network Engineer",
    "System Engineer",
    "Database Engineer",
    "Software Developer",
    "Software Architect",
    "Software Tester",
    "Software Consultant",
    "Software Analyst",
    "MLops Engineer",
]

export default function CreateInterview() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = React.useState(0);
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    const [internetConnection, setInternetConnection] = React.useState(false);

    const [camera, setCamera] = React.useState(false);
    const [microphone, setMicrophone] = React.useState(false);
    const [speakers, setSpeakers] = React.useState(false);

    const webCamCheck = () => {
        // check webcam
    }

    const microphoneCheck = () => {
        // check microphone
    }

    const speakersCheck = () => {
        // check speakers
    }

    const internetCheck = () => {
        // check internet connection

        isOnline().then(online => {
            setInternetConnection(online);
        })

    }
    const [interviewType, setInterviewType] = React.useState('');

    const CreateInterview = async () => {
        // create interview
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/createInterview`, {
            subject : "Data Structure and Algorithm"
        },
        {
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${Cookies.get('accessToken')}`
            }
        }
        )
        console.log(response.data);
        if(response.data.statusCode === 200){
            Cookies.set('interviewId', response.data.data._id);
            navigate('/live');
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
                        activeStep===0 &&
                        <div className="flex justify-between gap-5 my-5">
                        <CardContent className={` w-1/3 p-6
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
                            `w-1/3 p-6
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
                            `w-1/3 p-6
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

                    </div>}


                    {/* for jd take a job title expreience level hardness and jd */}

                    <div className="flex flex-col gap-5 my-5">
                        {activeStep === 1 && interviewType === 'JD' && <div>
                            <h1 className='text-2xl font-semibold'>Provide Interview Details</h1>
                            <div className="flex flex-col gap-5 my-5">

                                <div className="flex gap-5">

                                    <select className="p-3 border border-gray-300 rounded-lg w-1/2">
                                        <option value="">Select Job Title</option>
                                        {jobTitles.map((title) => (
                                            <option value={title}>{title}</option>
                                        ))}
                                    </select>
                                    <select className="p-3 border border-gray-300 rounded-lg w-1/2 p-2">
                                        <option value="">Select Experience Level</option>
                                        <option value="Fresher">Fresher</option>
                                        <option value="1-3 years">1-3 years</option>
                                        <option value="3-5 years">3-5 years</option>
                                        <option value="5-8 years">5-8 years</option>
                                        <option value="8-12 years">8-12 years</option>
                                        <option value="12+ years">12+ years</option>
                                    </select>
                                    </div>

                                    <textarea placeholder="Job Description" className="p-3 border border-gray-900 rounded-lg h-48"></textarea>



                            </div>
                        </div>}
                        {activeStep === 1 && interviewType === 'Resume' && <div>
                            <h1 className='text-2xl font-semibold'>Provide Interview Details</h1>
                            {/* load previous resume */}
                            <div className="flex flex-col gap-5 my-5">
                                <div className="flex gap-5 w-1/2">
                                    <input type="file" className="p-2 border border-gray-300 rounded-lg w-1/2" />
                                    <Button variant="contained"
                                    size='small'
                                    color="primary">Load Resume</Button>
                                </div>

                                {/* show privious resume as preview */}
                                <div className="flex gap-5 w-1/2">
                                    <textarea placeholder="Resume" className="p-3 border border-gray-900 rounded-lg h-48">
                                        {Resume}

                                    </textarea>
                                </div>
                            </div>
                        </div>}
                        {activeStep === 1 && interviewType === 'Core Subjects' && <div>
                            <h1 className='text-2xl font-semibold'>Provide Interview Details</h1>
                            <div className="flex flex-col gap-5 my-5">
                                <div className="flex gap-5 w-1/2">
                                    <select className="p-3 border border-gray-300 rounded-lg w-1/2">
                                        <option value="">Select Core Subjects</option>
                                        {coreSubjects.map((subject) => (
                                            <option value={subject}>{subject}</option>
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
                                    <Button variant="contained" color="success">Check</Button>
                                </div>
                                <div className="flex gap-5">
                                    <p className="w-1/2">Microphone</p>
                                    <Button variant="contained" color="success">Check</Button>
                                </div>
                                <div className="flex gap-5">
                                    <p className="w-1/2">Speakers</p>
                                    <Button variant="contained" color="success">Check</Button>
                                </div>
                                <div className="flex gap-5">
                                    <p className="w-1/2">Internet Connection</p>
                                    <Button variant="contained" color="success"
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
