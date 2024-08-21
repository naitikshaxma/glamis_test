import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export default function InterviewCard({ props, status }) {
    const navigate = useNavigate();
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
                        className="w-full bg-[#2b6030] hover:bg-[#1c3d1f]"
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
