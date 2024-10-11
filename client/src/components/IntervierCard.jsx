import {Button, Card, CardBody, CardFooter, Typography,} from "@material-tailwind/react";
import {useNavigate} from "react-router-dom";
import Cookies from 'js-cookie'
import {useState} from "react";
import {bearerInstance as instance} from "../helpers/instance";
import {toast} from "react-toastify";

export default function InterviewCard({props, status}) {
    const navigate = useNavigate();
    const [company, setCompany] = useState();  // todo: fetch Company for jd
    // const [adminInterviewId, setAdminInterviewId] = useState();  //deprecated as we will fetch it from backend


    const handleInterview = async () => {
        let url = '';
        let redirect = '';
        const response = await instance.post("/api/v1/interview/interviewQuestion/count", {interviewId: props._id})
        const questions = response.data.data.count;
        const removeCookies = ['interviewId', 'subject', 'jobTitle', 'selectedCompany', 'adminInterviewId', 'delta', 'verbal'];
        const newCookies = {interviewId: props._id, adminInterviewId, delta: questions};

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
            newCookies.jobTitle = props.title;
            newCookies.selectedCompany = company;
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


        await instance.post(url, {interviewId: props._id}); // todo: fix response NOT used
        navigate(redirect);
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

                <hr/>
                <div className="flex justify-between my-2">
                    <div>
                        <span className="font-bold">Date:</span> {props.start_time?.split('T')[0]}
                    </div>
                    <div>
                        <span className="font-bold">Time:</span> {props.start_time?.split('T')[1].split('.')[0]}
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
            >Coming Soon</Button>) : (<Button color="lightGreen"
                                              className="w-full bg-red-900 hover:bg-red-800"
                                              onClick={() => navigate(`/history/detailed/${props._id}`)}
            >View Result</Button>)}
        </CardFooter>
    </Card>);
}
