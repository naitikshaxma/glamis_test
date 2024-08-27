import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'
import axios from 'axios';
import { useEffect, useState } from "react";

export default function InterviewCard({ props, status }) {
    const navigate = useNavigate();
    const [totalQuestions, setTotalQuestions] = useState(15);
    const [company, setCompany] = useState();
    const [adminInterviewId, setAdminInterviewId] = useState();


    const handleInterview = async (e) => {
        Cookies.set('interviewId', props._id);
        if (props.type === 'subject') {
            Cookies.set('subject', props.description);
        }
        else if(props.type === 'written') {
            Cookies.set('subject', props.description);
        }
         else {
            Cookies.set('jobTitle', props.title);
            Cookies.set('selectedCompany', company);
        }
        Cookies.set('adminInterviewId', adminInterviewId);
        Cookies.set('delta', totalQuestions);

        localStorage.setItem('jd', props.description);
        if(props.type === 'written') {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/createInterviewByWrittenAdmin`, {
                interviewId: props._id
            }, {
                headers: {
                    "content-type": "application/json",
                }
            },)
            navigate('/written');
            return;
        }
        else {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/createInterviewByJDAdmin`, {
                interviewId: props._id
            }, {
                headers: {
                    "content-type": "application/json",
                }
            },)
        }
        
        navigate('/live');
    }

    const fetchAdminInterviewDetails = async() => {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/interview/fetch`, {
            interviewId: props._id
        }, {
            headers: {
                "content-type": "application/json",
            }
        });
        
        console.log(response.data.adminInterviewId);

        setCompany(response.data.company);
        setAdminInterviewId(response.data.adminInterviewId);
        setTotalQuestions(response.data.totalQuestions);
    }

    useEffect(() => {
        fetchAdminInterviewDetails();
    }, []);

    return (
        <Card className="m-4 h-fit w-1/4" >
            <CardBody>
                <Typography color="blue-gray" className="mb-2">
                    {/* heading of inerview */}
                    <div className="font-bold">{
                        props.title
                    }</div>
                </Typography>
                <Typography color="blue-gray">
                    {/* description of interview */}
                    <div className="my-2">

                        <i className='bx bx-broadcast bx-tada bx-rotate-90' ></i>
                        {/* active now */}
                        {/* <span className="text-[#2b6030] font-bold mx-1"> {
                    props.status }</span> */}
                        {props.status === 'active now' ? (
                            <span className="text-[#2b6030] font-bold mx-1"> {
                                props.status}</span>) : props.status === 'Upcoming Interview' ? (
                                    <span className="text-[#2b6030] font-bold mx-1"> {
                                        props.status}</span>) : (
                            <span className="text-[#2b6030] font-bold mx-1"> {
                                props.status}</span>
                        )
                        }
                    </div>

                    <hr />
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
                            <span className="font-bold">Duration:</span> {(new Date(props.end_time) - new Date(props.start_time)) / 1000 / 60} minutes
                        </div>
                    </div>
                </Typography>

            </CardBody>
            <CardFooter>
                {status === 'active now' ? (
                    <Button color="lightGreen"
                        className="w-full bg-[#2b6030] hover:bg-[#1c3d1f]" onClick={handleInterview}
                    >Join Interview</Button>
                ) : status === 'Upcoming Interview' ? (
                    <Button color="lightGreen"
                            className="w-full bg-yellow-900 hover:bg-yellow-800" disabled
                    >Coming Soon</Button>
                ) : (
                    <Button color="lightGreen"
                        className="w-full bg-red-900 hover:bg-red-800" onClick={() => navigate(`/history/detailed/${props._id}`)}
                    >View Result</Button>
                )}
            </CardFooter>
        </Card>
    );
}
