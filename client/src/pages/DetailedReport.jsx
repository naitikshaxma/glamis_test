import React, { useEffect, useState } from 'react';
import Technical from '../components/detailed_report/Technical';
import Verbal from '../components/detailed_report/Verbal';
import Behavioral from '../components/detailed_report/Behavioral';
import { Link, Element, scroller } from 'react-scroll';
import { TechnicalCard } from '../components/detailed_report/Technical';
import { questions } from '../components/detailed_report/Technical';
import { useRef } from 'react';
import avatar from "../assets/avatar.jpeg"
import axios from "axios";
import Cookies from "js-cookie";



const DetailedReport = () => {
    const [result, setResult] = useState([]);
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



    const fetchResultData = async () => {
        const interviewId = window.location.pathname.split('/').pop();
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/result/interviewresult`, { interviewId },

            {
                headers: {

                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('accessToken')}`
                }
            }
        );
        console.log(response.data);

        setResult(response.data);
    }



    useEffect(() => {
        fetchResultData();
    }, []);


    const actionBar = () => {
        switch (activeTab) {
            case 'technical':
                return (
                    <div className='w-full flex justify-around mb-5'>
                        <div className="w-1/8 mr-3 p-4 rounded-lg shadow-lg sticky top-0">
                            <div className="flex flex-col space-y-4">

                                {
                                    result.map((item, index) => (
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
                                    ))
                                }
                            </div>
                        </div>
                        <div
                            className="w-7/8 p-4 bg-lightBlue-500 rounded-lg shadow-lg h-[80vh] overflow-y-scroll"
                            id="scroll-container"
                            ref={scrollContainerRef}
                        >
                            {
                                result.map((item, index) => (
                                    <TechnicalCard
                                        key={index}
                                        qno={index}
                                        question={item.question}
                                        answer={item.answer}
                                        feedback={{
                                            good: [item.technicalExplanation[0]],
                                            improvement: [item.technicalExplanation[1]] 
                                        }}
                                        score={item.overallPerformance}
                                    />
                                ))
                            }
                        </div>
                    </div>
                )
            case 'verbal':
                return (
                    <div className='w-full flex mb-5'>
                        <div className="flex flex-col space-y-2 bg-lightblue-900 rounded-lg p-3">
                            <p className='font-semibold my-2'>Grammar score: {result.reduce((acc, item) => acc + item.grammar, 0) / result.length}</p>
                            <p className='font-semibold mb-2'>Vocabulary score: {result.reduce((acc, item) => acc + item.vocabulary, 0) / result.length}</p>
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
                                            {
                                                result[0].vocabularyExplanation[0]
                                            }
                                        </li>
                                        <li>
                                            {
                                                result[1].vocabularyExplanation[0]
                                            }
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
                                            {
                                                result[0].grammarExplanation[1]
                                            }
                                        </li>
                                        <li>
                                            {
                                                result[1].grammarExplanation[1]
                                            }
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
                        <div className="font-semibold text-lg text-right">Demo User</div>
                        <div className="font-semibold text-sm text-right">2115000000</div>
                        <div className="font-semibold text-sm text-right">Data Structures and Algorithms</div>
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
                        <Technical technicalScore={[
                            { name: 'Score', value: result.reduce((acc, item) => acc + item.overallPerformance, 0) / result.length },
                            { name: 'Remaining', value: 100 - result.reduce((acc, item) => acc + item.overallPerformance, 0) / result.length }
                        ]} />
                        <Verbal data={
                            [
                                { name: 'Vocabulary', score: result.reduce((acc, item) => acc + item.vocabulary, 0) / result.length },
                                { name: 'Grammar', score: result.reduce((acc, item) => acc + item.grammar, 0) / result.length }
                            ]
                        } />
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