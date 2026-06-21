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
import api from '../../helpers/api';

const TABLE_HEAD = ["S.no", "Company", "Date", "Slot", "Candidates", "Submitted", "Status", "Action"];

export default function ReviewBoard() {
    const [search, setSearch] = useSearchParams();
    const [scheduledInterviews, setScheduledInterviews] = useState(0);
    const [completedInterviews, setCompletedInterviews] = useState(0);
    const [pendingInterviews, setPendingInterviews] = useState(0);
    const [interviewDetails, setInterviewDetails] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    // Assigned-students viewer
    const [assigneeOpen, setAssigneeOpen] = useState(false);
    const [assignees, setAssignees] = useState([]);
    const [assigneeTitle, setAssigneeTitle] = useState("");
    const [assigneeLoading, setAssigneeLoading] = useState(false);

    const viewAssignees = async (id, company) => {
        setAssigneeTitle(company || "Interview");
        setAssignees([]);
        setAssigneeLoading(true);
        setAssigneeOpen(true);
        try {
            const res = await api.post(`/api/v1/admin/interview/assignees`, { adminInterviewId: id });
            setAssignees(res.data.assignees || []);
        } catch (err) {
            console.log(err);
        } finally {
            setAssigneeLoading(false);
        }
    };

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
            const res = await api.post(`/api/v1/admin/interview/fetchInterviewStatusCount`, {});
            setScheduledInterviews(res.data.totalInterviews);
            setCompletedInterviews(res.data.endedInterview);
            setPendingInterviews(res.data.pendingInterviews);

            const data = {
                page: search.get('page') || 1,
                limit: search.get('limit') || 10,
            };
            const response = await api.post(`/api/v1/admin/interview/fetchInterviewDetails`, data);

            setInterviewDetails(response.data.interviews);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchInterviewStatusCount();
    }, [search.get('page'), search.get('limit')]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <Typography variant="h4" className="font-bold text-gray-800 mb-6">
                Review Board
            </Typography>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <Card className="p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                    <Typography variant="small" className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                        Total Scheduled
                    </Typography>
                    <Typography variant="h3" className="mt-1 text-gray-800">{scheduledInterviews}</Typography>
                </Card>
                <Card className="p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                    <Typography variant="small" className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                        Conducted
                    </Typography>
                    <Typography variant="h3" className="mt-1 text-gray-800">{completedInterviews}</Typography>
                </Card>
                <Card className="p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                    <Typography variant="small" className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                        Pending
                    </Typography>
                    <Typography variant="h3" className="mt-1 text-gray-800">{pendingInterviews}</Typography>
                </Card>
            </div>

            {/* Table Section */}
            <Card className="rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header Bar */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <Typography variant="h6" className="font-bold text-gray-800">Interview Scheduled</Typography>
                        {/* Filters Row */}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <label htmlFor="limit" className="text-xs text-gray-500 font-medium">Limit</label>
                                <select name="limit" id="limit"
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
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

                            <div className="flex items-center gap-2">
                                <label htmlFor="page" className="text-xs text-gray-500 font-medium">Page</label>
                                <select name="page" id="page"
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-500"
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
                    </div>
                    <div>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs px-4 py-2.5 normal-case"
                            onClick={() => setOpenDialog(true)}
                        >
                            Download Multiple Attendance
                        </Button>

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

                {/* Table */}
                <div className="overflow-x-auto">
                    {interviewDetails.length > 0 ? (
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                            <tr>
                                {TABLE_HEAD.map((head) => (
                                    <th key={head} className="bg-gray-50 p-4 border-b border-gray-100">
                                        <Typography variant="small" className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {interviewDetails.map(({company, date, slot, candidates, submitted = 0, status, _id}, index) => {
                                const isLast = index === interviewDetails.length - 1;
                                const classes = `p-4 ${!isLast ? "border-b border-gray-50" : ""}`;

                                return (
                                    <tr key={_id} className="hover:bg-gray-50 transition-colors">
                                        <td className={classes}>
                                            <Typography variant="small" className="font-normal text-gray-600">
                                                {index + 1 + ((search.get('page') || 1) - 1) * (search.get('limit') || 10)}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" className="font-medium text-gray-800">
                                                {company}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" className="font-normal text-gray-600">
                                                {date.split('T')[0]}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" className="font-normal text-gray-600">
                                                {slot}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <Typography variant="small" className="font-normal text-gray-600">
                                                {candidates}
                                            </Typography>
                                        </td>
                                        <td className={classes}>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                candidates > 0 && submitted >= candidates
                                                    ? "bg-green-100 text-green-700"
                                                    : submitted > 0
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {submitted}/{candidates}
                                            </span>
                                        </td>
                                        <td className={classes}>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                status === "Ended"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className={classes}>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => viewAssignees(_id, company)}
                                                    className="bg-[#2c6031] hover:bg-[#1f4d26] text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                                                    View
                                                </button>
                                                <a target="_blank"
                                                   href={`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/interview/downloadAttendance/?interviewId=${_id}`}>
                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                                                        Download
                                                    </button>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <span className="text-5xl mb-3">📋</span>
                            <Typography variant="small" className="text-gray-400 font-medium">No interviews found</Typography>
                            <Typography variant="small" className="text-gray-300 mt-1">Schedule an interview to see it here</Typography>
                        </div>
                    )}
                </div>
            </Card>

            {/* Assigned students viewer */}
            <Dialog open={assigneeOpen} handler={() => setAssigneeOpen(false)} size="lg">
                <DialogHeader>Assigned Students — {assigneeTitle}</DialogHeader>
                <DialogBody className="max-h-[60vh] overflow-y-auto">
                    {assigneeLoading ? (
                        <Typography variant="small" className="text-gray-500">Loading…</Typography>
                    ) : assignees.length === 0 ? (
                        <Typography variant="small" className="text-gray-500">No students assigned.</Typography>
                    ) : (
                        <table className="w-full table-auto text-left">
                            <thead>
                                <tr>
                                    {["#", "Name", "Email", "Branch", "Roll No", "Progress", "Status"].map((h) => (
                                        <th key={h} className="bg-gray-50 p-2 border-b border-gray-100">
                                            <Typography variant="small" className="font-semibold text-gray-500 text-xs uppercase">{h}</Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {assignees.map((a, i) => (
                                    <tr key={a.email + i} className="hover:bg-gray-50">
                                        <td className="p-2 text-sm text-gray-600">{i + 1}</td>
                                        <td className="p-2 text-sm text-gray-800 font-medium">{a.name}</td>
                                        <td className="p-2 text-sm text-gray-600">{a.email}</td>
                                        <td className="p-2 text-sm text-gray-600">{a.branch || "—"}</td>
                                        <td className="p-2 text-sm text-gray-600">{a.rollNo || "—"}</td>
                                        <td className="p-2 text-sm text-gray-600">{a.attempted}/{a.total}</td>
                                        <td className="p-2">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                a.status === "Completed" ? "bg-green-100 text-green-700"
                                                    : a.status === "In progress" ? "bg-blue-100 text-blue-700"
                                                        : a.status === "Missed" ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                            }`}>{a.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="gray" onClick={() => setAssigneeOpen(false)}>Close</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
