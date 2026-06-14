import React, {useEffect, useState} from 'react';
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Card,
    Typography,
    Checkbox,
} from "@material-tailwind/react";
import {Link, useSearchParams} from 'react-router-dom';
import axios from 'axios';

const TABLE_HEAD = ["S.no", "Company", "Date", "Slot", "Candidates", "Status", "Action"];

export default function ReviewBoard() {
    const [search, setSearch] = useSearchParams();
    const [scheduledInterviews, setScheduledInterviews] = useState(0);
    const [completedInterviews, setCompletedInterviews] = useState(0);
    const [pendingInterviews, setPendingInterviews] = useState(0);
    const [interviewDetails, setInterviewDetails] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    const handleAttendanceDownload = async (e) => {
        e.preventDefault();
        const formdata = new FormData(e.target);
        const data = Object.fromEntries(formdata.entries());
        console.log(data);
        const interviewIds = Object.keys(data);
        console.log(interviewIds);

        let url =`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/interview/downloadAttendance/?`;
        for (let i = 0; i < interviewIds.length; i++) {
            url += `interviewId=${interviewIds[i]}&`;
        }
        window.open(url, '_blank');





    }

    const fetchInterviewStatusCount = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/interview/fetchInterviewStatusCount`, {}, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setScheduledInterviews(res.data.totalInterviews);
            setCompletedInterviews(res.data.endedInterview);
            setPendingInterviews(res.data.pendingInterviews);

            const data = {
                page: search.get('page') || 1,
                limit: search.get('limit') || 10,
            };
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/interview/fetchInterviewDetails`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setInterviewDetails(response.data.interviews);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchInterviewStatusCount();
    }, [search.get('page'), search.get('limit')]);

    return (
        <div>
            <div className="flex flex-col p-6 bg-white rounded-lg">
                <div className="flex justify-between w-full border-b pb-2">
                    <h1 className="text-2xl font-semibold mb-4">Review Board</h1>
                </div>
                <div className="flex justify-between w-full">
                    <div className="w-1/3">
                        <div className="flex flex-col m-3 border p-3 rounded-lg bg-gray-100">
                            <p className="text-sm font-semibold">Total Interview Scheduled</p>
                            <p className="text-2xl font-semibold text-green-900">{scheduledInterviews}</p>
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="flex flex-col m-3 border p-3 rounded-lg bg-gray-100">
                            <p className="text-sm font-semibold">Total Interview Conducted</p>
                            <p className="text-2xl font-semibold text-yellow-900">{completedInterviews}</p>
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="flex flex-col m-3 border p-3 rounded-lg bg-gray-100">
                            <p className="text-sm font-semibold">Total Interview Pending</p>
                            <p className="text-2xl font-semibold text-red-900">{pendingInterviews}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between w-full">
                    <div className="w-full">
                        <div className="flex flex-col m-3 border p-3 rounded-lg bg-gray-100">
                            {/* Table with a filter feature */}
                            <div className="flex justify-between ">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-lg font-semibold">Interview Scheduled</h1>

                                    {/* Limit filter */}
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="limit">Limit</label>
                                        <select name="limit" id="limit"
                                                className="border border-gray-200 p-2 rounded-lg"
                                                onChange={(e) => setSearch(params => {
                                                    params.set('limit', e.target.value);
                                                    params.set('page', 1);
                                                    return params;
                                                })} value={search.get('limit') || "10"}>
                                            <option value="10">10</option>
                                            <option value="50">50</option>
                                            <option value="80">80</option>
                                            <option value="100">100</option>
                                        </select>
                                    </div>

                                    {/* Page filter */}
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="page">Page</label>
                                        <select name="page" id="page" className="border border-gray-200 p-2 rounded-lg"
                                                onChange={(e) => setSearch(params => {
                                                    params.set('page', e.target.value);
                                                    return params;
                                                })} value={search.get('page') || "1"}>
                                            {Array.from({length: Math.ceil(scheduledInterviews / (search.get('limit') || 10))}, (_, i) => i + 1).map((page) => (
                                                <option key={page} value={page}>{page}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {/*<input type="text" placeholder="Search"*/}
                                    {/*       className="border border-gray-200 p-2 rounded-lg"/>*/}


                                    <button className="bg-blue-500 text-white p-2 rounded-lg"
                                            onClick={() => setOpenDialog(true)}>
                                        Download Multiple Attendance
                                    </button>
                                    <Dialog open={openDialog} handler={() => setOpenDialog(false)} animate={{
                                        mount: {scale: 1, y: 0},
                                        unmount: {scale: 0.9, y: -100},
                                    }}>
                                        <DialogHeader>Select Interviews to Download Attendance</DialogHeader>
                                        <form onSubmit={handleAttendanceDownload}>
                                            <DialogBody>
                                                <div className="flex flex-col gap-2 h-[50vh] overflow-scroll">
                                                    {interviewDetails.map(({company, _id, candidates}, index) => {
                                                            return (
                                                                <div key={_id} className="flex items-center gap-2">
                                                                    <Checkbox color="blue" id={_id} name={_id} value={company}/>
                                                                    <Typography variant="small" color="blue-gray"
                                                                                className="font-normal">
                                                                        {index+1}. {company}, {candidates} candidates
                                                                    </Typography>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>

                                            </DialogBody>
                                            <DialogFooter>
                                                <Button
                                                    variant="text"
                                                    color="red"
                                                    onClick={() => setOpenDialog(false)}
                                                    className="mr-1"
                                                >
                                                    <span>Cancel</span>
                                                </Button>
                                                <Button variant="gradient" color="green" type="submit">
                                                    <span>Confirm</span>
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Dialog>
                                </div>
                            </div>

                            {/* Interview Details Table */}
                            <Card className="h-full w-full overflow-scroll my-3">
                                <table className="w-full min-w-max table-auto text-left">
                                    <thead>
                                    <tr>
                                        {TABLE_HEAD.map((head) => (
                                            <th
                                                key={head}
                                                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                                            >
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal leading-none opacity-70"
                                                >
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {interviewDetails.map(({company, date, slot, candidates, status, _id}, index) => {
                                        const classes = index === interviewDetails.length - 1 ? "p-4" : "p-4 border-b border-blue-gray-50";

                                        return (
                                            <tr key={_id}>
                                                <td className={classes}>
                                                    <Typography variant="small" color="blue-gray"
                                                                className="font-normal">
                                                        {index + 1 + ((search.get('page') || 1) - 1) * (search.get('limit') || 10)}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" color="blue-gray"
                                                                className="font-normal">
                                                        <Link to="" className='text-blue-500'>{company}</Link>
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" color="blue-gray"
                                                                className="font-normal">
                                                        {date.split('T')[0]}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography as="a" href="#" variant="small" color="blue-gray"
                                                                className="font-medium">
                                                        {slot}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" color="blue-gray"
                                                                className="font-normal">
                                                        {candidates}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small"
                                                                color={status === "Ended" ? "red" : "orange"}
                                                                className="font-normal">
                                                        {status}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    {/* Download Attendance Button */}
                                                    <a target="_blank"
                                                       href={`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/interview/downloadAttendance/?interviewId=${_id}`}>
                                                        <button
                                                            className="bg-blue-500 text-white p-2 rounded-lg">Download<br/>Attendance
                                                        </button>
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
        ;
}
