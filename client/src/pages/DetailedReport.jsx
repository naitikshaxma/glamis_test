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
import Behavioral from '../components/detailed_report/Behavioral';
import { Link, Element, scroller } from 'react-scroll';
import { TechnicalCard } from '../components/detailed_report/Technical';
import { questions } from '../components/detailed_report/Technical';
import { useRef } from 'react';
import avatar from "../assets/avatar.jpeg"




const DetailedReport = () => {
    const [open, setOpen] = useState(null);
    const [activeTab, setActiveTab] = useState('technical');

    const handleOpen = (value) => {
        setOpen(open === value ? null : value);
    };

    const [selectedQuestion, setSelectedQuestion] = useState(0);
    const scrollContainerRef = useRef(null);

    const handleQuestionClick = (index) => {
        setSelectedQuestion(index);
        scroller.scrollTo(`question-${index}`, {
            duration: 500,
            delay: 0,
            smooth: true,
            containerId: 'scroll-container'
        });
    };


    const actionBar = () => {
        switch (activeTab) {
            case 'technical':
                return (
                    <div className='w-full flex justify-around mb-5'>
                        <div className="w-1/8 mr-3 p-4 rounded-lg shadow-lg sticky top-0">
                            <div className="flex flex-col space-y-4">
                                {questions.map((_, index) => (
                                    <Link
                                        key={index}
                                        to={`question-${index}`}
                                        smooth={true}
                                        duration={500}
                                        className={`flex flex-col space-y-2 p-3 cursor-pointer rounded ${selectedQuestion === index ? 'bg-[#2b6030] text-white' : ''}`}
                                        onClick={() => handleQuestionClick(index)}
                                    >
                                        Q{index + 1}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div
                            className="w-7/8 p-4 bg-lightBlue-500 rounded-lg shadow-lg h-[60vh] overflow-y-scroll"
                            id="scroll-container"
                            ref={scrollContainerRef}
                        >
                            {questions.map((question, index) => (
                                <Element
                                    key={index}
                                    name={`question-${index}`}
                                    id={`question-${index}`}
                                >
                                    <TechnicalCard
                                        question={question.question}
                                        answer={question.answer}
                                        feedback={question.feedback}
                                    />
                                </Element>
                            ))}
                        </div>
                    </div>
                )
            case 'verbal':
                return (
                    <div className='w-full flex mb-5'>
                        <div className="flex flex-col space-y-2 bg-lightblue-900 rounded-lg p-3">
                    <div className="flex flex-col space-y-2 font-semibold">Feedback</div>
                    <hr />
                    <div className='flex w-full justify-between font-semibold'>
                        <div className="flex flex-col space-y-2 font-semibold w-1/3">Attributes</div>
                        <div className="flex flex-col space-y-2 font-semibold w-2/3">Description</div>
                    </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">What went well</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className="list-disc">
                               <li>
                                 You have a good vocabulary and have used it effectively in the conversation.
                               </li>
                               <li>
                                 You are able to express your thoughts clearly and concisely.
                                 </li>

                            </ul>
                        </div>
                    </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">Areas for improvement</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className="list-disc">
                                <li>
                                    You can improve your grammar and sentence formation.
                                </li>
                                <li>
                                    You can improve your fluency and pronunciation.
                                </li>
                            </ul>
                        </div>
                    </div>
                    <hr />
                </div>
                    </div>
                )
            case 'behavioral':
                return (
                    <div className='w-full flex mb-5'>
                        <div className="flex flex-col space-y-2 bg-lightblue-900 rounded-lg p-3">
                    <div className="flex flex-col space-y-2 font-semibold">Feedback</div>
                    <hr />
                    <div className='flex w-full justify-between font-semibold'>
                        <div className="flex flex-col space-y-2 font-semibold w-1/3">Attributes</div>
                        <div className="flex flex-col space-y-2 font-semibold w-2/3">Description</div>
                    </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">What went well</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className="list-disc">
                                 <li>
                                    You have a good vocabulary and have used it effectively in the conversation.
                                 </li>
                                 <li>
                                    You are able to express your thoughts clearly and concisely.
                                    </li>

                            </ul>
                        </div>
                    </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">Areas for improvement</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className="list-disc">
                                <li>
                                    You can improve your fluency and pronunciation.
                                </li>
                            </ul>
                        </div>
                    </div>
                    <hr />
                </div>
                    </div>

                )
            default:
                return (
                    <>Technical</>
                )
        }
    }

return (
        <div className="w-[80%] mx-auto">
            <div className="header bg-green-100 w-full flex justify-between p-4 border-b-0 border-2 border-green-900">
                <div className="flex">
                    <div className="avatar w-20">
                        <img className='w-full overflow-hidden' src="https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png" alt="" />
                    </div>
                    <div className="flex flex-col ml-4">
                        <div className="font-semibold text-lg">GLAMIS</div>
                        <div className="font-semibold text-sm">G.L.A. University</div>
                        <div className="font-semibold text-sm">Mathura, Uttar Pradesh</div>
                        <div className="font-semibold text-sm">India, 250909</div>
                    </div>
                </div>
                <div className="flex items-center">
                <div className="flex flex-col mr-4">
                    <div className="font-semibold text-lg text-right">Shubh Chaturvedi</div>
                    <div className="font-semibold text-sm text-right">2115000976</div>
                    <div className="font-semibold text-sm text-right">Data Structures and Algorithm</div>
                </div>
                <div className="avatar w-20 border-2 border-green-900">
                    <img src={avatar} alt="" />
                </div>
                </div>
            </div>
            <div className="analysis flex flex-col h-full">
                <div className="border-t-0">
                    <div className="bg-[#2b6030] text-white text-lg flex justify-center p-1 font-semibold">
                        <span>Analysis</span>
                    </div>
                    <div className='flex w-full'>
                        <Technical />
                        <Verbal />
                        <Behavioral />
                    </div>
                </div>
                <div className="report mt-4">
                    <div className="bg-[#2b6030] text-white text-lg flex justify-center p-1 font-semibold">
                    <span>Detailed Report</span>
                </div>
                <div className="w-full shadow">
                <div className="flex border-b mb-6">
                            <button className={`py-2 px-4 ${activeTab === 'technical' ? 'border-b-2 border-[#2b6030] text-[#2b6030]' : 'text-gray-600'}`} onClick={() => setActiveTab('technical')} >
                        Technical Skills
                    </button>
                    <button
                                className={`py-2 px-4 ${activeTab === 'verbal' ? 'border-b-2 border-[#2b6030] text-[#2b6030]' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('verbal')}
                    >
                        Verbal Skills
                    </button>
                    <button
                                className={`py-2 px-4 ${activeTab === 'behavioral' ? 'border-b-2 border-[#2b6030] text-[#2b6030]' : 'text-gray-600'}`} onClick={() => setActiveTab('behavioral')} > Behavioral Skills
                    </button>
                </div>
                <div className="flex">
                            {actionBar()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedReport;