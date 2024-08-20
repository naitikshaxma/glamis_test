import React, { useState } from "react";
import {
    Card,
    CardBody,
    Input,
    Button,
    Typography,
    Select,
    Option,
    Textarea,
} from "@material-tailwind/react";

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

export default function ScheduleInterview() {
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

    const handleNext = () => {
        if (currentStep === 1 && interviewName && companyName && date && noOfQuestions && position) {
            setCurrentStep(2);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        // Handle form submission logic here
        console.log("Form submitted");
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

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
            <div className="w-full max-w-6xl h-full p-8 rounded-lg shadow-lg bg-white flex flex-col">
                <div className="mb-6 flex justify-between items-center border-b pb-4">
                    <Typography variant="h4" color="blue-gray" className="font-semibold">
                        Interview Creation
                    </Typography>
                </div>

                <div className="flex-grow">
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
                        </>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-auto">
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
        </div>
    );
}
