import React, { useEffect, useMemo, useState } from 'react';
import Technical from '../components/detailed_report/Technical';
import { Verbal, VerbalCard } from '../components/detailed_report/Verbal';
import Behavioral from '../components/detailed_report/Behavioral';
import { Link, Element, scroller } from 'react-scroll';
import { TechnicalCard } from '../components/detailed_report/Technical';
import { useRef } from 'react';
import avatar from "../assets/avatar.jpeg"
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { Svar, SvarCard } from '../components/detailed_report/Svar';



const DetailedReport = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState([]);
    const [open, setOpen] = useState(null);
    const [activeTab, setActiveTab] = useState('');
    const [varTab1, setVarTab1] = useState('Technical Skills');
    const [varTab2, setVarTab2] = useState('Verbal Skills');
    const [studentName,setStudentName] = useState(Cookies.get("fullName"));

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
    // const reportTemplateRef = useRef(null);

    // const handleGeneratePdf = () => {
	// 	const doc = new jsPDF({
	// 		format: 'a4',
	// 		unit: 'px',
	// 	});

	// 	// Adding the fonts.
	// 	doc.setFont('Inter-Regular', 'normal');

	// 	doc.html(reportTemplateRef.current, {
	// 		async callback(doc) {
	// 			await doc.save('report.pdf');
	// 		},
	// 	});
	// };





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
        if(response.data.studentName){
            setStudentName(response.data.studentName);
        }
        setResult(response.data.interviewResults);
        if (response.data.interviewType === 'verbal') {
            // setVarTab1('verbal'); no need to set this to verbal 
            setActiveTab('verbal')
        } else if (response.data.interviewType === 'written') {
            setVarTab1('Written Skills');
            setActiveTab('Written Skills')
            setVarTab2('Content Information');
        } else if (response.data.interviewType === 'Svar'){
            setVarTab1('Svar')
            setActiveTab('Svar')
            setVarTab2('')
        } else if (response.data.interviewType === 'Subject') {
            setVarTab1('Technical Skills')
            setActiveTab('Technical Skills')
        } else if (response.data.interviewType === 'company') {
            setVarTab1('Technical')
            setActiveTab('technical')
        }
    }



    useEffect(() => {
        fetchResultData();
    }, []);


    const actionBar = () => {
        const uniqueResults = result.reduce((acc, item) => {
            // Check if the item with the same question already exists in the accumulator
            if (!acc.some(existingItem => existingItem.question === item.question)) {
                acc.push(item);
            }
            return acc;
        }, []);
        switch (activeTab) {
            case 'technical':
                return (
                    <div className='w-full flex gap-3 mb-5'>
                        <div className="w-16 shrink-0 p-2 rounded-lg shadow-lg sticky top-0 h-fit">
                            <div className="flex flex-col space-y-2">
                                {
                                    result.map((item, index) => (
                                        <Link
                                            key={index}
                                            to={`#question-${index}`}
                                            smooth={true}
                                            duration={500}
                                            className={`flex w-full flex-col items-center p-2 cursor-pointer rounded text-sm ${selectedQuestion === index ? 'bg-[#2b6030] text-white' : 'hover:bg-gray-100'}`}
                                            onClick={() => handleQuestionClick(index)}
                                        >
                                            Q{index + 1}
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                        <div
                            className="flex-1 p-4 rounded-lg shadow-lg h-[80vh] overflow-y-auto"
                            id="scroll-container"
                            ref={scrollContainerRef}
                        >
                            {
                                result.map((item, index) => (
                                    <div id={`question-${index}`} key={index} className="mb-4">
                                        <TechnicalCard
                                            qno={index}
                                            question={item.question}
                                            answer={item.answer}
                                            feedback={{
                                                good: [item.technicalExplanation[0]],
                                                improvement: [item.technicalExplanation[1]]
                                            }}
                                            score={item.overallPerformance}
                                            expectedAnswer={item.expectedAnswer}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )

            case 'verbal':
                return (
                    <div className='w-full flex gap-3 mb-5'>
                        <div className="w-16 shrink-0 p-2 rounded-lg shadow-lg sticky top-0 h-fit">
                            <div className="flex flex-col space-y-2">
                                {
                                    result.map((item, index) => (
                                        <Link
                                            key={index}
                                            to={`question-${index}`}
                                            smooth={true}
                                            duration={500}
                                            className={`flex flex-col items-center p-2 cursor-pointer rounded text-sm ${selectedQuestion === index ? 'bg-[#2b6030] text-white' : 'hover:bg-gray-100'}`}
                                            onClick={() => handleQuestionClick(index)}
                                        >
                                            Q{index + 1}
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                        <div
                            className="flex-1 p-4 rounded-lg shadow-lg h-[80vh] overflow-y-auto"
                            id="scroll-container"
                            ref={scrollContainerRef}
                        >
                            {
                                result.map((item, index) => (
                                    <div key={index} className="mb-4">
                                        <VerbalCard
                                            qno={index}
                                            question={item.question}
                                            answer={item.answer}
                                            feedback={{
                                                good: [item.grammarExplanation[0]],
                                                improvement: [item.grammarExplanation[1]]
                                            }}
                                            grammarScore={item.grammar}
                                            vocabularyScore={item.vocabulary}
                                        />
                                    </div>
                                ))
                            }
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
                case 'Svar': 
                    return( 
                    <div className='w-full flex gap-3 mb-5'>
                        <div className="w-16 shrink-0 p-2 rounded-lg shadow-lg sticky top-0 h-fit">
                            <div className="flex flex-col space-y-2">
                            {
                                result?.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={`question-${index}`}
                                        smooth={true}
                                        duration={500}
                                        className={`flex w-full justify-center items-center p-2 cursor-pointer rounded text-sm ${selectedQuestion === index ? 'bg-[#2b6030] text-white' : 'hover:bg-gray-100'}`}
                                        onClick={() => handleQuestionClick(index)}
                                    >
                                        Q{index + 1}
                                    </Link>
                                ))
                            }
                            </div>
                        </div>
                        <div
                            className="flex-1 p-4 rounded-lg shadow-lg h-[80vh] overflow-y-auto"
                            id="scroll-container"
                            ref={scrollContainerRef}
                        >
                            {
                                result.map((item, index) => (
                                    <div id={`question-${index}`} key={index} className="mb-4">
                                        <SvarCard
                                            qno={index}
                                            question={item.question}
                                            answer={item.answer}
                                            feedback={{
                                                pronounciation: {
                                                    good: [item.pronunciationExplanation[0]],
                                                    improvement: [item.pronunciationExplanation[1]]
                                                },
                                                correctness: {
                                                    good: [item.correctnessExplanation[0]],
                                                    improvement: [item.correctnessExplanation[1]]
                                                },
                                                grammar: {
                                                    good: [item.grammarExplanation[0]],
                                                    improvement: [item.grammarExplanation[1]]
                                                }}}
                                            score={item.overallPerformance}
                                            expectedAnswer={item.expectedAnswer}
                                            grammar={item.grammar}
                                            correctness={item.correctness}
                                            pronounciation={item.pronounciation}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    )
            default:
                return (
                    <>Technical</>
                )
        }
    }

    const downlowdReport = () => {
        // ctrl + p -> save as pdf
        window.print();
    }

    return (
        <div className="w-full px-6">
            {/* two buttons 1 for home and 2 for downlowd report */}
            <div className="flex justify-between my-4 print:hidden relative z-50">
                <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg cursor-pointer transition-colors"
                onClick={() => navigate('/dashboard')}
                >Home</button>
                <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg cursor-pointer transition-colors"
                onClick={downlowdReport}
                >Download Report</button>
            </div>
            <div className="header bg-green-100 w-full flex justify-between p-4 border-b-0 border-2 border-green-900">
                <div className="flex">
                    <div className="avatar w-20">
                        <img className='w-full overflow-hidden' src="https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png" alt="" />
                    </div>
                    <div className="flex flex-col ml-4">
                        <div className="font-semibold text-lg">GLAMIS</div>
                        <div className="font-semibold text-sm">G.L.A. University</div>
                        <div className="font-semibold text-sm">Mathura, Uttar Pradesh</div>
                        <div className="font-semibold text-sm">India, 281406</div>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="flex flex-col mr-4">
                        <div className="font-semibold text-lg text-right">{studentName}</div>
                        <div className="font-semibold text-sm text-right">2115000000</div>
                        <div className="font-semibold text-sm text-right">Mock Interview Results</div>
                    </div>
                    <div className="avatar w-20 border-2 border-green-900">
                        <img src="https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg" alt="" />
                    </div>
                </div>
            </div>
            <div className="analysis flex flex-col h-full">
                <div className="border-t-0">
                    <div className="bg-[#2b6030] text-white text-lg flex justify-center p-1 font-semibold">
                        <span>Analysis</span>
                    </div>
                    <div className='flex w-full'>
                        {activeTab === 'Svar' ? 
                        <Svar pronounciationScore={[
                            { name: 'Score', value: result.reduce((acc, item) => acc + item.pronounciation, 0) / result.length },
                            { name: 'Remaining', value: 100 - result.reduce((acc, item) => acc + item.pronounciation, 0) / result.length }
                          ]} 
                          grammarScore={[
                              { name: 'Score', value: result.reduce((acc, item) => acc + item.grammar, 0) / result.length },
                              { name: 'Remaining', value: 100 - result.reduce((acc, item) => acc + item.grammar, 0) / result.length }
                            ]} 
                            correctnessScore={[
                              { name: 'Score', value: result.reduce((acc, item) => acc + item.correctness, 0) / result.length },
                              { name: 'Remaining', value: 100 - result.reduce((acc, item) => acc + item.correctness, 0) / result.length }
                            ]} 
                          />
                            :
                            <>
                                <Technical technicalScore={[
                                    { name: 'Score', value: result.reduce((acc, item) => acc + item.overallPerformance, 0) / result.length },
                                    { name: 'Remaining', value: 100 - result.reduce((acc, item) => acc + item.overallPerformance, 0) / result.length }
                                ]} varTab1={varTab1}
                                />
                                <Verbal data={
                                    [
                                        { name: 'Vocabulary', score: result.reduce((acc, item) => acc + item.vocabulary, 0) / result.length },
                                        { name: 'Grammar', score: result.reduce((acc, item) => acc + item.grammar, 0) / result.length }
                                    ]
                                } varTab2={varTab2} />
                            </>
                    }
                        
                    </div>
                </div>
                <div className="report mt-4">
                    <div className="bg-[#2b6030] text-white text-lg flex justify-center p-1 font-semibold">
                        <span>Detailed Report</span>
                    </div>
                    <div className="w-full shadow">
                        <div className="flex border-b mb-6">
                            <button className={`py-2 px-4 ${activeTab === 'technical' ? 'border-b-2 border-[#2b6030] text-[#2b6030]' : 'text-gray-600'}`} onClick={() => setActiveTab('technical')} >
                                {varTab1}
                            </button>
                            <button
                                className={`py-2 px-4 ${activeTab === 'verbal' ? 'border-b-2 border-[#2b6030] text-[#2b6030]' : 'text-gray-600'}`}
                                onClick={() => setActiveTab('verbal')}
                            >
                                {varTab2}
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