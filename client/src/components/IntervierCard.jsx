import { Button, Card, CardBody, CardFooter, Typography, } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'
import { useEffect, useState } from "react";
import { bearerInstance as instance } from "../helpers/instance";
import { toast } from "react-toastify";
import { Tooltip } from "@mui/material";
import { setAvatarSession, clearAvatarSession } from "../helpers/interviewSession";

function formatInterviewDuration(start, end, estimatedMinutes) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startValid = !Number.isNaN(startDate.getTime());
    const endValid = !Number.isNaN(endDate.getTime()) && endDate > startDate;
    if (startValid && endValid) {
        const durationMinutes = Math.round((endDate - startDate) / 60000);
        if (durationMinutes > 0) {
            return `${durationMinutes} minute${durationMinutes === 1 ? '' : 's'}`;
        }
    }
    if (typeof estimatedMinutes === 'number' && estimatedMinutes > 0) {
        return `${Math.round(estimatedMinutes)} minute${Math.round(estimatedMinutes) === 1 ? '' : 's'}`;
    }
    return "Not available";
}

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

    const startDate = new Date(props.start_time);
    const endDate = new Date(props.end_time);
    const durationLabel = formatInterviewDuration(props.start_time, props.end_time, props.estimatedDurationMinutes);
    const hasValidStart = !Number.isNaN(startDate.getTime());
    const hasValidEnd = !Number.isNaN(endDate.getTime()) && endDate > startDate;

    const handleInterview = async () => {
        // The admin scheduled this slot as a real-time avatar interview: launch the
        // native avatar studio directly (no text-interview create / token spend; the
        // FastAPI agent drives it). The studio's own setup card gates camera/mic +
        // fullscreen, so we skip the /system-check step used by the text flow.
        if (props.avatar_enabled) {
            const titleParts = (props.title || "").split(" | ");
            const company = titleParts[1] || "";
            const position = titleParts[2] || "";
            let role;
            let type = 'technical';
            if (props.type === 'company') {
                role = [position, company].filter(Boolean).join(' at ') || 'the role';
            } else if (props.type === 'verbal' || props.type === 'Svar') {
                role = 'Communication';
                type = 'verbal';
            } else if (props.type === 'written') {
                role = props.description || 'Communication';
                type = 'verbal';
            } else {
                // subject-based
                role = props.description || 'the role';
                if (/data structures|algorithm/i.test(props.description || "")) type = 'dsa';
            }
            setAvatarSession({
                type,
                role,
                difficulty: 'medium',
                count: Number(props.totalQuestions) || 5,
                name: Cookies.get('fullName') || '',
                // Admin-scheduled: the student can't change the configured settings.
                locked: true,
            });
            navigate('/live');
            return;
        }

        // Standard text interview — drop any stale avatar session so /live renders
        // the text interview, not a previous avatar studio.
        clearAvatarSession();

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
                {props.avatar_enabled && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#2b6030] bg-[#2b6030]/10 border border-[#2b6030]/20 rounded-full px-2 py-0.5">
                        <i className='bx bx-user-voice'></i> Real-time Avatar
                    </span>
                )}
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
                        <span className="font-bold">Date:</span> {hasValidStart ? startDate.toLocaleDateString() : 'Not available'}
                    </div>
                    <div>
                        <span className="font-bold">Time:</span> {hasValidStart ? startDate.toLocaleTimeString() : 'Not available'}
                    </div>
                </div>
                <div className="my-2">
                    <div>
                        <span className="font-bold">Duration:</span> {durationLabel}
                    </div>
                </div>
            </Typography>

        </CardBody>
        <CardFooter>
            {status === 'active now' ? (<Button color="lightGreen"
                className="w-full bg-[#2b6030] hover:bg-[#1c3d1f]"
                onClick={handleInterview}
            >{props.avatar_enabled ? 'Join Avatar Interview' : 'Join Interview'}</Button>) : status === 'Upcoming Interview' ? (<Button color="lightGreen"
                className="w-full bg-yellow-900 hover:bg-yellow-800"
                disabled
            >Coming Soon</Button>) : feedbackStatus ? <button className="bg-[#2b6030] text-white font-semibold px-4 py-2"><a href={`/history/detailed/${props._id}`}>View Result</a></button> : <Tooltip title="Please fill the feedback form"> <button className="bg-[#2b6030] text-white font-semibold px-4 py-2"><a href="/feedback">Feedback</a></button></Tooltip>}
        </CardFooter>
    </Card>);
}
