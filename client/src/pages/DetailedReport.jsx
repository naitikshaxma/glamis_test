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
import Technical from '../components/detailed_report/Technical';
import Verbal from '../components/detailed_report/Verbal';



const behavioralData = [
    { subject: 'Body Posture', A: 90, fullMark: 100 },
    { subject: 'Tone', A: 50, fullMark: 100 },
    { subject: 'Leadership', A: 100, fullMark: 150 },
    { subject: 'Work Ethic', A: 110, fullMark: 150 },
];


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
                    <Verbal />
                )
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
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
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
                    <Technical />
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