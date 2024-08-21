import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";

export default function InterviewCard({ props }) {
    return (
        // createdAt
        // :
        // "2024-08-21T16:23:57.617Z"
        // description
        // :
        // "undefined Software Engineer"
        // is_active
        // :
        // true
        // start_time
        // :
        // "2024-08-21T16:23:57.605Z"
        // title
        // :
        // "Software Engineer"
        // updatedAt
        // :
        // "2024-08-21T16:23:57.617Z"
        // __v
        // :
        // 0
        // _id
        // :
        // "66c6149d36e4131e38f1c000"

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
                            <span className="font-bold">Duration:</span> {props.end_time?.split('T')[1]}
                        </div>
                    </div>
                </Typography>

            </CardBody>
            <CardFooter>

                {props.status === 'active now' ? (
                    <Button color="lightGreen"
                        className="w-full bg-[#2b6030] hover:bg-[#1c3d1f]"
                    >Join Interview</Button>
                ) : props.status === 'Upcoming Interview' ? (
                    <Button color="lightGreen"
                        className="w-full bg-[#2b6030] hover:bg-[#1c3d1f]"
                    >Coming Soon</Button>
                ) : (
                    <Button color="lightGreen"
                        className="w-full bg-[#2b6030] hover:bg-[#1c3d1f]"
                    >View Result</Button>
                )}
            </CardFooter>
        </Card>
    );
}
