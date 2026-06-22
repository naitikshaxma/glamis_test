import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStickyState, clearStickyStatePrefix, useClearOnNavigate } from "../../../hooks/useStickyState";
import {
    Input,
    Button,
    Typography,
    Select,
    Option,
    Textarea,
} from "@material-tailwind/react";
import { saveAs } from 'file-saver';
import api from "../../../helpers/api";
import AvatarModeToggle from "./AvatarModeToggle";

const softwarePositions = [
    "Software Developer",
    "Product Engineer",
    "Data Scientist",
    "Front-End Developer",
    "Back-End Developer",
    "Full-Stack Developer",
    "DevOps Engineer",
    "QA Engineer",
    "UX/UI Designer",
    "Systems Analyst",
];

const FormInput = ({ label, value, onChange, type = "text", placeholder, max }) => (
    <div className="flex flex-col mb-5">
        <Typography variant="small" className="mb-2 font-medium text-gray-700">
            {label}
        </Typography>
        <Input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            max={max}
            className="!border-gray-200 focus:!border-green-700 rounded-lg"
        />
    </div>
);

const sampleCSV = `email\nanikroy@gla.ac.in\nshubh@gla.ac.in\nadmin@gla.ac.in`;

export default function CompanyInterview() {
    useClearOnNavigate("company_");
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useStickyState(1, "company_currentStep");
    const [interviewName, setInterviewName] = useStickyState("", "company_interviewName");
    const [companyName, setCompanyName] = useStickyState("", "company_companyName");
    const [date, setDate] = useStickyState("", "company_date");
    const [duration, setDuration] = useStickyState({ from: "", to: "" }, "company_duration");
    const [noOfQuestions, setNoOfQuestions] = useStickyState("", "company_noOfQuestions");
    const [position, setPosition] = useStickyState("", "company_position");
    const [easy, setEasy] = useStickyState("", "company_easy");
    const [medium, setMedium] = useStickyState("", "company_medium");
    const [hard, setHard] = useStickyState("", "company_hard");
    const [jobDescription, setJobDescription] = useStickyState("", "company_jobDescription");
    const [questions, setQuestions] = useStickyState([], "company_questions");
    const [emailObject, setEmailObject] = useStickyState([], "company_emailObject");
    const [avatarEnabled, setAvatarEnabled] = useStickyState(false, "company_avatarEnabled");

    const handleNext = () => {
        if (currentStep === 1 && interviewName && companyName && date && duration.from && duration.to && noOfQuestions && position) {
            if (duration.from >= duration.to) {
                toast.error("End time must be after start time!");
                return;
            }
            if (!emailObject || emailObject.length === 0) {
                toast.error("Please upload a CSV with student emails first!");
                return;
            }

            const totalTypes = (Number(easy) || 0) + (Number(medium) || 0) + (Number(hard) || 0);
            if (totalTypes > Number(noOfQuestions)) {
                toast.error("Total difficulty questions cannot exceed total No. of Questions!");
                return;
            }

            setCurrentStep(2);
        } else if (currentStep === 1) {
            toast.error("Please fill all required fields in Step 1");
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {

        try {
            console.log(questions);
            const response = await api.post(`/api/v1/admin/interview/company/create`, {
                name: interviewName,
                company: companyName,
                date,
                from: duration.from,
                to: duration.to,
                no_of_questions: noOfQuestions,
                position: position,
                easy_remaining: Number(easy) || 0,
                medium_remaining: Number(medium) || 0,
                hard_remaining: Number(hard) || 0,
                job_description: jobDescription,
                questions : questions,
                students: emailObject,
                type: "company",
                avatar_enabled: avatarEnabled
            }, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("Form submitted successfully:", response.data);
            if (response.data?.skipped?.length) {
                toast(response.data.message, { icon: '⚠️', duration: 7000 });
            } else {
                toast.success('Interview Created Successfully! 🎉');
            }
            clearStickyStatePrefix("company_");
            setCurrentStep(1); setInterviewName(""); setCompanyName(""); setDate(""); setDuration({from:"", to:""});
            setNoOfQuestions(""); setPosition(""); setEasy(""); setMedium(""); setHard("");
            setJobDescription(""); setQuestions([]); setEmailObject([]); setAvatarEnabled(false);
            navigate('/admin/dashboard');
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(error?.response?.data?.message || 'Failed to create interview');
        }
    };

    const handleAddQuestion = () => {
        if (questions.length < parseInt(noOfQuestions)) {
            setQuestions([...questions, { question: "", difficulty: "Easy" }]);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleFileUpload = (event) => {
        const emailRegex = /([a-zA-Z0-9._-]+)@(gla.ac.in|glamis.in)/g;
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const contents = e.target.result;
                // accept global.ac.in or glamis.in  
                const emailIds = contents.match(emailRegex);
                console.log(emailIds)
                setEmailObject(emailIds || []);
            };
            reader.readAsText(file);
        }
    };

    const handleDownloadSampleCSV = () => {
        const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'sample.csv');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <div>
                    <Typography variant="h4" className="font-bold text-gray-800">Schedule Company Mock Interview</Typography>
                    <Typography variant="small" className="text-gray-500">Fill in the details to schedule a new interview</Typography>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    {currentStep === 1 && (
                        <>
                            <Typography variant="small" className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-4">Interview Details</Typography>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput label="Interview Name" value={interviewName} onChange={(e) => setInterviewName(e.target.value)} placeholder="Interview Name" />
                                <FormInput label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" />
                                <FormInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormInput label="Duration (From)" type="time" value={duration.from} onChange={(e) => setDuration({ ...duration, from: e.target.value })} />
                                <FormInput label="Duration (To)" type="time" value={duration.to} onChange={(e) => setDuration({ ...duration, to: e.target.value })} />
                                <div className="flex flex-col mb-5">
                                    <Typography variant="small" className="mb-2 font-medium text-gray-700">Position</Typography>
                                    <Select value={position} onChange={(value) => setPosition(value)} className="!border-gray-200 focus:!border-green-700 rounded-lg" placeholder="Select Position">
                                        {softwarePositions.map((pos) => (<Option key={pos} value={pos}>{pos}</Option>))}
                                    </Select>
                                </div>
                                <FormInput label="No. of Questions" type="number" value={noOfQuestions} onChange={(e) => setNoOfQuestions(e.target.value)} placeholder="Number of Questions" max={20} />
                            </div>

                            <hr className="my-6 border-gray-200" />
                            <Typography variant="small" className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-4">Difficulty Distribution</Typography>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput label="Easy" type="number" value={easy} onChange={(e) => setEasy(e.target.value)} max={8} />
                                <FormInput label="Medium" type="number" value={medium} onChange={(e) => setMedium(e.target.value)} max={7} />
                                <FormInput label="Hard" type="number" value={hard} onChange={(e) => setHard(e.target.value)} max={5} />
                            </div>

                            <AvatarModeToggle enabled={avatarEnabled} setEnabled={setAvatarEnabled} />

                            <hr className="my-6 border-gray-200" />
                            <Typography variant="small" className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-4">Students</Typography>
                            <div className="flex items-end gap-6">
                                <div className="flex flex-col">
                                    <Typography variant="small" className="mb-2 font-medium text-gray-700">Upload Student EmailIDs</Typography>
                                    <input type="file" accept=".csv" onChange={handleFileUpload}
                                        className="file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-lg file:text-sm file:font-semibold file:bg-[#2c6031] file:text-white hover:file:bg-[#1f4d26] file:cursor-pointer text-sm text-gray-500" />
                                </div>
                                <Button size="sm" variant="outlined" color="gray" onClick={handleDownloadSampleCSV} className="rounded-lg text-xs">
                                    Show Sample CSV
                                </Button>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <Typography variant="small" className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-4">Job Description</Typography>
                            <div className="mb-5">
                                <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here" className="!border-gray-200 focus:!border-green-700 rounded-lg" />
                            </div>

                            <hr className="my-6 border-gray-200" />
                            <Typography variant="small" className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-4">Questions</Typography>
                            <div className="overflow-y-auto max-h-[400px] space-y-4">
                                {questions.map((q, index) => (
                                    <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex flex-col flex-1">
                                            <Typography variant="small" className="mb-2 font-medium text-gray-700">Question {index + 1} (Optional)</Typography>
                                            <Input value={q.question} onChange={(e) => handleQuestionChange(index, "question", e.target.value)} placeholder="Enter question" className="!border-gray-200 focus:!border-green-700 rounded-lg" />
                                        </div>
                                        <div className="flex flex-col w-40">
                                            <Typography variant="small" className="mb-2 font-medium text-gray-700">Difficulty</Typography>
                                            <Select value={q.difficulty} onChange={(value) => handleQuestionChange(index, "difficulty", value)} className="!border-gray-200">
                                                <Option value="Easy">Easy</Option>
                                                <Option value="Medium">Medium</Option>
                                                <Option value="Hard">Hard</Option>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                                {questions.length < parseInt(noOfQuestions) && (
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-[#2c6031] hover:bg-[#1f4d26] rounded-lg" onClick={handleAddQuestion}>+</Button>
                                        <Button size="sm" className="bg-red-500 hover:bg-red-600 rounded-lg" onClick={() => setQuestions(questions.slice(0, -1))}>−</Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {currentStep > 1 ? (
                            <Button variant="outlined" color="gray" onClick={handlePrevious} className="rounded-lg px-8 py-3">Previous</Button>
                        ) : <div />}
                        {currentStep < 2 ? (
                            <Button onClick={handleNext} className="bg-[#2c6031] hover:bg-[#1f4d26] rounded-lg px-8 py-3">Next</Button>
                        ) : (
                            <Button onClick={handleSubmit} className="bg-[#2c6031] hover:bg-[#1f4d26] rounded-lg px-8 py-3">Submit</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
