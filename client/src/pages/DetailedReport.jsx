import React, { useState } from 'react';
import {
    Card, CardHeader, CardBody, Typography,
    Accordion, AccordionHeader, AccordionBody, Progress, IconButton
} from '@material-tailwind/react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png'; // Add the path to your logo file

const verbalData = [
    { subject: 'Grammar', A: 90, fullMark: 100 },
    { subject: 'Clarity', A: 55, fullMark: 100 },
    { subject: 'Vocabulary', A: 12, fullMark: 100 },
];

const behavioralData = [
    { subject: 'Body Posture', A: 90, fullMark: 100 },
    { subject: 'Tone', A: 50, fullMark: 100 },
    { subject: 'Leadership', A: 100, fullMark: 150 },
    { subject: 'Work Ethic', A: 110, fullMark: 150 },
];

const technicalQuestions = [
    {
        question: "Explain a project where you used React.",
        userAnswer: "I built a web app using React...",
        idealAnswer: "In a recent project, I developed a web application using React...",
        score: 80
    },
    {
        question: "Describe how you manage state in a React app.",
        userAnswer: "I use Redux for state management...",
        idealAnswer: "I manage state using Redux...",
        score: 70
    },
    {
        question: "What is your approach to testing React components?",
        userAnswer: "I use Jest and React Testing Library...",
        idealAnswer: "My approach to testing React components includes using Jest and React Testing Library...",
        score: 90
    },
];

const technicalScore = [
    { name: 'Score', value: 80 },
    { name: 'Remaining', value: 20 },
];

const COLORS = ['#0088FE', '#00C49F'];

const DetailedReport = () => {
    const [open, setOpen] = useState(null);
    const [activeTab, setActiveTab] = useState('verbal');

    const handleOpen = (value) => {
        setOpen(open === value ? null : value);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'verbal':
                return (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <Card className="w-full rounded-lg shadow-lg">
                            <CardHeader className="bg-lightBlue-500 rounded-t-lg p-4">
                                <Typography variant="h3">
                                    Verbal Skills
                                </Typography>
                            </CardHeader>
                            <CardBody className="flex flex-col lg:flex-row gap-6 p-4">
                                <div className="w-full lg:w-1/3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={verbalData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                            <Radar name="Verbal Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full lg:w-2/3 space-y-2">
                                    <Typography variant="body1"><strong>Communication:</strong> Measures the ability to convey information effectively.</Typography>
                                    <Typography variant="body1"><strong>Listening:</strong> Evaluates how well the individual comprehends spoken information.</Typography>
                                    <Typography variant="body1"><strong>Clarity:</strong> Assesses the lucidity of the spoken or written message.</Typography>
                                    <Typography variant="body1"><strong>Grammar:</strong> Evaluates the correctness of language use.</Typography>
                                    <Typography variant="body1"><strong>Vocabulary:</strong> Measures the range of words known and used correctly.</Typography>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                );
            case 'behavioral':
                return (
                    <div className="flex flex-col lg:flex-row gap-6 h-full">
                        <Card className="w-full h-full rounded-lg shadow-lg">
                            <CardHeader className="bg-lightBlue-500 rounded-t-lg p-4">
                                <Typography variant="h3">
                                    Behavioral Skills
                                </Typography>
                            </CardHeader>
                            <CardBody className="flex flex-col lg:flex-row gap-6 p-4">
                                <div className="w-full lg:w-1/3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={behavioralData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis angle={90} domain={[0, 150]} />
                                            <Radar name="Behavioral Skills" dataKey="A" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full lg:w-2/3 space-y-2">
                                    <Typography variant="body1"><strong>Teamwork:</strong> Assesses the ability to work effectively in a team.</Typography>
                                    <Typography variant="body1"><strong>Problem Solving:</strong> Evaluates the ability to find solutions to difficult or complex issues.</Typography>
                                    <Typography variant="body1"><strong>Adaptability:</strong> Measures how well the individual can adjust to changes.</Typography>
                                    <Typography variant="body1"><strong>Leadership:</strong> Assesses the ability to lead and manage a team.</Typography>
                                    <Typography variant="body1"><strong>Work Ethic:</strong> Evaluates the dedication and discipline towards work.</Typography>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                );
            case 'technical':
                return (
                    <div className="flex flex-col items-center space-y-4 p-4 h-full">
                        <Card className="w-full rounded-lg shadow-lg">
                            <CardHeader className="bg-lightBlue-500 rounded-t-lg p-4">
                                <Typography variant="h3">
                                    Technical Skills
                                </Typography>
                            </CardHeader>
                            <CardBody className="flex flex-col items-center space-y-4 p-4">
                                <ResponsiveContainer width="50%" height={250}>
                                    <PieChart>
                                        <Pie data={technicalScore} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                            {technicalScore.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <Typography variant="body1" className="my-2">Domain Knowledge: 80/100</Typography>
                                <div className="w-full space-y-2">
                                    {technicalQuestions.map((q, index) => (
                                        <div key={index} className="my-2">
                                            <Typography variant="body2"><strong>{q.question}</strong></Typography>
                                            <Progress value={q.score} className="my-1" />
                                            <Accordion open={open === index} onClick={() => handleOpen(index)}>
                                                <AccordionHeader>
                                                    View Answers
                                                </AccordionHeader>
                                                <AccordionBody>
                                                    <Typography variant="body2"><strong>User Answer:</strong> {q.userAnswer}</Typography>
                                                    <Typography variant="body2"><strong>Ideal Answer:</strong> {q.idealAnswer}</Typography>
                                                </AccordionBody>
                                            </Accordion>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col w-full h-screen p-6 shadow-md rounded-lg">
            <div className="flex justify-between items-center p-4">
                <img src={logo} alt="Logo" className="h-24" />
                <IconButton variant="text" color="blue-gray" onClick={() => alert('Close button clicked')}>
                    <XMarkIcon className="w-6 h-6" />
                </IconButton>
            </div>
            <h1 className="text-2xl font-semibold mb-4">Detailed Report</h1>
            <div className="flex border-b mb-6">
                <button
                    className={`py-2 px-4 ${activeTab === 'verbal' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('verbal')}
                >
                    Verbal Skills
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'behavioral' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`} onClick={() => setActiveTab('behavioral')} > Behavioral Skills
                </button>
                <button className={`py-2 px-4 ${activeTab === 'technical' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`} onClick={() => setActiveTab('technical')} >
                    Technical Skills
                </button>
            </div>
            <div className='h-screen'>
                {renderContent()}
            </div>
        </div>
    );
};

export default DetailedReport;