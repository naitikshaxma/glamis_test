import { Button, Card, CardBody, CardFooter, Typography, } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'
import { useEffect, useState } from "react";
import { bearerInstance as instance } from "../helpers/instance";
import { toast } from "react-toastify";
import { Tooltip } from "@mui/material";

export default function InterviewCard({ props, status }) {
    const navigate = useNavigate();
    const [company, setCompany] = useState();  // todo: fetch Company for jd
    const [feedbackStatus, setFeedbackStatus] = useState(false);
    // const [adminInterviewId, setAdminInterviewId] = useState();  //deprecated as we will fetch it from backend

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await instance.post("/api/v1/users/get-user-data-profile", {});
                setFeedbackStatus(response.data.data.user.feedback_submitted);
            } catch (err) {
                console.error("Error fetching user profile data:", err);
            }
        }
        getUser();
    }, [])
    const handleInterview = async () => {
        try {
            let url = '';
            let redirect = '';
            const response = await instance.post("/api/v1/interview/interviewQuestion/count", { interviewId: props._id })
            const questions = response.data.data.count;
            const currentQuestion = response.data.data.currentQuestion;
            const removeCookies = ['interviewId', 'subject', 'jobTitle', 'selectedCompany', 'adminInterviewId', 'delta', 'verbal'];
            const newCookies = { interviewId: props._id, adminInterviewId: "", delta: questions, currentQuestion: currentQuestion };

            if (props.type === 'subject') {
                newCookies.subject = props.description;
                newCookies.mockType = 'subject';
                url = '/api/v1/interview/createInterviewByJDAdmin';
                redirect = '/live';
            }

            if (props.type === 'written') {
                newCookies.subject = props.description;
                newCookies.mockType = 'written';
                url = '/api/v1/interview/createInterviewByWrittenAdmin';
                redirect = '/written';
            }
            if (props.type === 'company') {
                const titleParts = props.title.split(" | ");
                newCookies.jobTitle = titleParts[2] || props.title;
                newCookies.selectedCompany = titleParts[1] || "";
                newCookies.mockType = 'company';
                url = '/api/v1/interview/createInterviewByJDAdmin';
                redirect = '/live';
            }

            if (props.type === 'verbal') {
                newCookies.verbal = true;
                newCookies.mockType = 'verbal';
                url = '/api/v1/interview/createInterviewByVerbalAdmin';
                redirect = '/live';
            }

            if (props.type === 'Svar') {
                newCookies.svar = props.description;
                newCookies.mockType = 'svar';
                url = '/api/v1/interview/createInterviewBySvarAdmin';
                redirect = '/live';
            }

            if (url === '') {
                return toast.error('Interview type not found');
            }

            removeCookies.forEach(cookie => Cookies.remove(cookie));
            Object.entries(newCookies).forEach(([key, value]) => Cookies.set(key, value));
            localStorage.setItem('jd', props.description);


            // Redirect to system check page with query parameters
            // This ensures they complete camera/mic tests and cache browser permissions before entering the exam page.
            navigate(`/system-check?url=${encodeURIComponent(url)}&redirect=${encodeURIComponent(redirect)}&id=${encodeURIComponent(props._id)}`);
        } catch (error) {
            console.error("Error starting interview:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to start interview");
        }
    }

    return (<Card className="m-4 h-fit w-1/4">
        <CardBody>
            <Typography color="blue-gray" className="mb-2">
                {/* heading of inerview */}
                <div className="font-bold">{props.title}</div>
            </Typography>
            <Typography color="blue-gray">
                {/* description of interview */}
                <div className="my-2">

                    <i className='bx bx-broadcast bx-tada bx-rotate-90'></i>
                    {/* active now */}
                    {/* <span className="text-[#2b6030] font-bold mx-1"> {
                    props.status }</span> */}
                    {props.status === 'active now' ? (<span
                        className="text-[#2b6030] font-bold mx-1"> {props.status}</span>) : props.status === 'Upcoming Interview' ? (
                            <span className="text-[#2b6030] font-bold mx-1"> {props.status}</span>) : (
                        <span className="text-[#2b6030] font-bold mx-1"> {props.status}</span>)}
                </div>

                <hr />
                <div className="flex justify-between my-2">
                    <div>
                        <span className="font-bold">Date:</span> {(new Date(props.start_time)).toLocaleDateString()}
                    </div>
                    <div>
                        <span className="font-bold">Time:</span> {(new Date(props.start_time)).toLocaleTimeString()}
                    </div>
                </div>
                <div className="my-2">
                    <div>
                        <span
                            className="font-bold">Duration:</span> {(new Date(props.end_time) - new Date(props.start_time)) / 1000 / 60} minutes
                    </div>
                </div>
            </Typography>

        </CardBody>
        <CardFooter>
            {status === 'active now' ? (<Button color="lightGreen"
                className="w-full bg-[#2b6030] hover:bg-[#1c3d1f]"
                onClick={handleInterview}
            >Join Interview</Button>) : status === 'Upcoming Interview' ? (<Button color="lightGreen"
                className="w-full bg-yellow-900 hover:bg-yellow-800"
                disabled
            >Coming Soon</Button>) : feedbackStatus ? <button className="bg-[#2b6030] text-white font-semibold px-4 py-2"><a href={`/history/detailed/${props._id}`}>View Result</a></button> : <Tooltip title="Please fill the feedback form"> <button className="bg-[#2b6030] text-white font-semibold px-4 py-2"><a href="/feedback">Feedback</a></button></Tooltip>}
        </CardFooter>
    </Card>);
}
