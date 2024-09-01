import React, { useState } from "react";
import {
    Input,
    Button,
    Typography,
    Select,
    Option,
    Textarea,
} from "@material-tailwind/react";
import { saveAs } from 'file-saver';
import axios from "axios";

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
    <div className="flex flex-col mb-6">
        <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            {label}
        </Typography>
        <Input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            max={max}
            className="!border-blue-gray-200 focus:!border-gray-900 py-2 px-3 rounded-md"
        />
    </div>
);

const sampleCSV = `email\nanikroy@gla.ac.in\nshubh@gla.ac.in\nadmin@gla.ac.in`;

export default function CompanyInterview() {
    const [currentStep, setCurrentStep] = useState(1);
    const [interviewName, setInterviewName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [date, setDate] = useState("");
    const [duration, setDuration] = useState({ from: "", to: "" });
    const [noOfQuestions, setNoOfQuestions] = useState("");
    const [position, setPosition] = useState("");
    const [easy, setEasy] = useState("");
    const [medium, setMedium] = useState("");
    const [hard, setHard] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [questions, setQuestions] = useState([{ question: "", difficulty: "Easy" }]);
    const [emailObject, setEmailObject] = useState([]);

    const handleNext = () => {
        if (currentStep === 1 && interviewName && companyName && date && noOfQuestions && position) {
            setCurrentStep(2);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/interview/company/create`, {
                name: interviewName,
                company: companyName,
                date,
                from: duration.from,
                to: duration.to,
                no_of_questions: noOfQuestions,
                position: position,
                easy_remaining: easy,
                medium_remaining: medium,
                hard_remaining: hard,
                job_description: jobDescription,
                questions,
                students: emailObject,
                type: "company"
            }, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("Form submitted successfully:", response.data);
        } catch (error) {
            console.error("Error submitting form:", error);
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
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const contents = e.target.result;
                // accept global.ac.in or glamis.in  
                const emailIds = contents.match(emailRegex);
                console.log(emailIds)
                setEmailObject(emailIds);
            };
            reader.readAsText(file);
        }
    };

    const handleDownloadSampleCSV = () => {
        const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'sample.csv');
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-100">
            <div className="flex-grow flex flex-col p-8 bg-white">
                <div className="mb-6 flex justify-between items-center border-b pb-4">
                    <Typography variant="h4" color="blue-gray" className="font-semibold">
                        Interview Creation
                    </Typography>
                </div>

                <div className="flex-grow overflow-hidden">
                    {/* Combined Form: Basic Information and Duration */}
                    {currentStep === 1 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <FormInput
                                    label="Interview Name"
                                    value={interviewName}
                                    onChange={(e) => setInterviewName(e.target.value)}
                                    placeholder="Interview Name"
                                />
                                <FormInput
                                    label="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Company Name"
                                />
                                <FormInput
                                    label="Date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <FormInput
                                    label="Duration (From)"
                                    type="time"
                                    value={duration.from}
                                    onChange={(e) => setDuration({ ...duration, from: e.target.value })}
                                />
                                <FormInput
                                    label="Duration (To)"
                                    type="time"
                                    value={duration.to}
                                    onChange={(e) => setDuration({ ...duration, to: e.target.value })}
                                />
                                <div className="flex flex-col">
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                        Position
                                    </Typography>
                                    <Select
                                        value={position}
                                        onChange={(value) => setPosition(value)}
                                        className="!border-blue-gray-200 focus:!border-gray-900 py-2 px-3 rounded-md"
                                        placeholder="Select Position"
                                    >
                                        {softwarePositions.map((pos) => (
                                            <Option key={pos} value={pos}>
                                                {pos}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <FormInput
                                    label="No. of Questions"
                                    type="number"
                                    value={noOfQuestions}
                                    onChange={(e) => setNoOfQuestions(e.target.value)}
                                    placeholder="Number of Questions"
                                    max={20}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <FormInput
                                    label="Easy"
                                    type="number"
                                    value={easy}
                                    onChange={(e) => setEasy(e.target.value)}
                                    max={8}
                                />
                                <FormInput
                                    label="Medium"
                                    type="number"
                                    value={medium}
                                    onChange={(e) => setMedium(e.target.value)}
                                    max={7}
                                />
                                <FormInput
                                    label="Hard"
                                    type="number"
                                    value={hard}
                                    onChange={(e) => setHard(e.target.value)}
                                    max={5}
                                />
                            </div>
                            <div className="flex space-x-4 mb-6">
                                <div className="flex flex-col">
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                        Upload Student EmailIDs
                                    </Typography>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-[#2c6031] file:text-white hover:file:bg-[#1f4d26]"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                        Download Sample CSV
                                    </Typography>
                                    <Button
                                        size="sm"
                                        onClick={handleDownloadSampleCSV}
                                        className="bg-[#2c6031] text-white hover:bg-[#1f4d26] transition-colors duration-300"
                                    >
                                        Show Sample CSV
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Job Description, Add Questions, and Upload Record */}
                    {currentStep === 2 && (
                        <>
                            <div className="space-y-6 mb-6">
                                <div className="flex flex-col mb-6">
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                        Paste Job Description
                                    </Typography>
                                    <Textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here"
                                        className="!border-blue-gray-200 focus:!border-gray-900 py-2 px-3 rounded-md"
                                    />
                                </div>

                                <div className="overflow-y-auto max-h-[400px]">
                                    {questions.map((q, index) => (
                                        <div key={index} className="flex justify-between mb-4">
                                            <div className="flex flex-col flex-1">
                                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                                    Add New Question (Optional)
                                                </Typography>
                                                <Input
                                                    value={q.question}
                                                    onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                                                    placeholder="Enter question"
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col ml-4">
                                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                                    Set Question Difficulty
                                                </Typography>
                                                <Select
                                                    value={q.difficulty}
                                                    onChange={(value) => handleQuestionChange(index, "difficulty", value)}
                                                    className="w-full"
                                                >
                                                    <Option value="Easy">Easy</Option>
                                                    <Option value="Medium">Medium</Option>
                                                    <Option value="Hard">Hard</Option>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                    {questions.length < parseInt(noOfQuestions) && (
                                        <Button
                                            size="sm"
                                            className="bg-[#2c6031] text-white hover:bg-[#1f4d26] transition-colors duration-300"
                                            onClick={handleAddQuestion}
                                        >
                                            +
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-auto p-4 border-t border-gray-300">
                    {currentStep > 1 && (
                        <Button
                            size="lg"
                            onClick={handlePrevious}
                            className="bg-[#2c6031] text-white hover:bg-[#1f4d26] transition-colors duration-300"
                        >
                            Previous
                        </Button>
                    )}
                    {currentStep < 2 ? (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            className="bg-[#2c6031] text-white hover:bg-[#1f4d26] transition-colors duration-300"
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            className="bg-[#2c6031] text-white hover:bg-[#1f4d26] transition-colors duration-300"
                        >
                            Submit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
