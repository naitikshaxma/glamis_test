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
import { Button } from '@mui/material';

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

const fluencyScore = [{ name: 'Fluency', value: 80 }];
const clarityScore = [{ name: 'Clarity', value: 55 }];
const communicationScore = [{ name: 'Communication', value: 90 }];
const pronunciationScore = [{ name: 'Pronunciation', value: 70 }];

const VerbalCard = () => {
    return (
        <div className="flex flex-col bg-lightBlue-500 rounded-lg p-4">
            {/* question */}
            <div className="flex flex-col space-y-2 text-semibold">
               <strong>
                Que: Explain a project where you used React.
                
                </strong> 
            </div>
            {/* answer */}
            <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-2">
                    <strong>Your Answer:</strong>
                    React is a popular open-source JavaScript library for building user interfaces, particularly for single-page applications where you want a fast, interactive user experience. Here are some key aspects of React:

                    Component-Based Architecture: React is built around components, which are reusable pieces of UI that can manage their own state. Components can be nested, managed, and handled independently, promoting modular and maintainable code.

                    Declarative Syntax: React uses a declarative paradigm, which makes it easier to reason about your application and aims to be both efficient and flexible. Developers can describe how the UI should look for different states, and React will efficiently update and render just the right components when the data changes.
                </div>

                {/* a gray color table feedback */}
                <div className="flex flex-col space-y-2 bg-lightblue-900 rounded-lg p-3">
                    <div className="flex flex-col space-y-2">Feedback</div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 text-semibold w-1/3">Attributes</div>
                        <div className="flex flex-col space-y-2 text-semibold w-2/3">Description </div>
                    </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">What went well</div>
                        <div className="flex flex-col space-y-2 w-2/3">The answer provided a good overview of React and its key features.</div>
                        </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">Areas for improvement</div>
                        <div className="flex flex-col space-y-2 w-2/3">The answer lacked depth and detail, and could have included specific examples of projects or challenges faced while using React.</div>
                    </div> 
                    <hr />
                    </div>

                    
            </div>
        </div>
    )
}


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
                        <div className="w-full rounded-lg">
                            <div className="bg-lightBlue-500 rounded-t-lg p-4">
                                <Typography variant="h3">
                                    Verbal Skills
                                </Typography>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-6 p-4">
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
                            </div>

                        </div>
                    </div>
                );
            case 'behavioral':
                return (
                    <div className="flex flex-col lg:flex-row gap-6 h-full">
                        <Card className="w-full h-full rounded-lg shadow-lg">
                            <div className="bg-lightBlue-500 rounded-t-lg p-4">
                                <Typography variant="h3">
                                    Behavioral Skills
                                </Typography>
                            </div>
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
                            <div className="bg-lightBlue-500 rounded-t-lg p-4">
                                <Typography variant="h3">
                                    Technical Skills
                                </Typography>
                            </div>
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
                                
                            </CardBody>
                        </Card>
                        <div className="flex ">
                                <div className='w-[80%] m-auto flex justify around m-5'>



                                    <div className="w-1/8 mr-3 p-4 bg-lightBlue-500 rounded-lg shadow-lg">
                                        {/* Q1 to Q10 */}
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex flex-col space-y-2
                                        bg-blue-300 text-white rounded-lg p-3"> Q1 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q2 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q3 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q4 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q5 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q6 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q7 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q8 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q9 </div>
                                            <div className="flex flex-col space-y-2 p-3"> Q10 </div>
                                        </div>

                                    </div>

                                    <div className="w-7/8 p-4 bg-lightBlue-500 rounded-lg shadow-lg">
                                        <VerbalCard />

                                    </div>

                                </div>



                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col w-full h-screen p-6 rounded-lg">
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