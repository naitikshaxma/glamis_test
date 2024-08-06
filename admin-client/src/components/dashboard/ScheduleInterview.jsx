import React from "react";
import { useCountries } from "use-react-countries";
import {
    Card,
    CardHeader,
    CardBody,
    Input,
    Button,
    Typography,
    Select,
    Option,
    Textarea
} from "@material-tailwind/react";

export default function ScheduleInterview() {
    const { countries } = useCountries();
    const [interviewName, setInterviewName] = React.useState("");
    const [companyName, setCompanyName] = React.useState("");
    const [date, setDate] = React.useState("");
    const [duration, setDuration] = React.useState({ from: "", to: "" });
    const [noOfQuestions, setNoOfQuestions] = React.useState("");
    const [position, setPosition] = React.useState("");
    const [jobDescription, setJobDescription] = React.useState("");
    const [studentRecord, setStudentRecord] = React.useState(null);

    return (
        <div className="flex flex-col justify-center h-[95vh]">
            <Card className="ml-[18vw] mt-4 mr-8">
                <CardHeader
                    color=""
                    floated={false}
                    shadow={true}
                    className="text-center bg-[#2c6031] p-4"
                >
                    <Typography variant="h5" color="white">
                        Schedule Interview
                    </Typography>
                </CardHeader>
                <CardBody>
                    <form className="space-y-6">
                        {/* First row: Interview Name, Company Name, and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Interview Name
                                </Typography>
                                <Input
                                    value={interviewName}
                                    onChange={(e) => setInterviewName(e.target.value)}
                                    placeholder="Interview Name"
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Company Name
                                </Typography>
                                <Input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Company Name"
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Date
                                </Typography>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                        </div>

                        {/* Second row: Duration, No. of Questions, and Position */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Duration (From)
                                </Typography>
                                <Input
                                    type="time"
                                    value={duration.from}
                                    onChange={(e) => setDuration({ ...duration, from: e.target.value })}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Duration (To)
                                </Typography>
                                <Input
                                    type="time"
                                    value={duration.to}
                                    onChange={(e) => setDuration({ ...duration, to: e.target.value })}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    No. of Questions
                                </Typography>
                                <Input
                                    type="number"
                                    max={20}
                                    value={noOfQuestions}
                                    onChange={(e) => setNoOfQuestions(e.target.value)}
                                    placeholder="Number of Questions"
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Position
                                </Typography>
                                <Select
                                    value={position}
                                    onChange={(value) => setPosition(value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                    placeholder="Select Position"
                                >
                                    {countries.map(({ name }) => (
                                        <Option key={name} value={name}>
                                            {name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Third row: Job Description and Student Record */}
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Paste Job Description
                                </Typography>
                                <Textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description here"
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="mb-2 font-medium"
                                >
                                    Upload Student Record
                                </Typography>
                                <input
                                    type="file"
                                    onChange={(e) => setStudentRecord(e.target.files[0])}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="bg-[#2c6031] text-white hover:bg-[#1f4d26] transition-colors duration-300"
                        >
                            Submit
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
