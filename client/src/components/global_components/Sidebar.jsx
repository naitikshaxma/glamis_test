import React from "react";
import { Card, Typography, List, ListItem, ListItemPrefix, Alert, Button } from "@material-tailwind/react";
import { UserCircleIcon, InboxIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import { UisBars } from '@iconscout/react-unicons-solid';
import { SidebarContext } from "../../hooks/SideBarContextHook";


import avatar from "../../assets/avatar.jpeg";
import Cookies from "js-cookie";
import { useRecoilValue } from "recoil";
import { tokenState } from "../../store/atoms/token";
import { toast } from "react-toastify";



export default function Sidebar() {

    const navigate = useNavigate();
    const tokenLeft = useRecoilValue(tokenState);
    const [openAlert, setOpenAlert] = React.useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);


    const navItems = [{
        name: 'Dashboard',
        icon: <InboxIcon className="h-5 w-5" />,
        href: '/dashboard'
    },
    {
        name: 'Profile',
        icon: <UserCircleIcon className="h-5 w-5" />,
        href: '/profile'
    },
    {
        name: 'My Interviews',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
        </svg>,
        href: '/myInterview'
    },
    {
        name: 'History',
        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>,
        href: '/history'
    },
    {
        name: 'Feedback',
        icon: <CubeTransparentIcon className="h-5 w-5" />,
        href: '/feedback'
    }
    ]

    return (
        <div className="flex">
            {isSidebarOpen && (
                <Card className="w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 h-screen fixed top-0 left-0 bg-white flex flex-col">
                    <div className="mb-2 flex items-center gap-4 p-4">
                        <img src="https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png" alt="GLAMIS" className="h-8 w-8" />
                        <Typography variant="h5" color="blue-gray">
                            GLAMIS
                        </Typography>
                        <UisBars className="ml-20 cursor-pointer" />
                    </div>
                    <List>
                        {navItems.map((item, index) => (
                            <Link to={item.href} key={index}>
                                <ListItem>
                                    <ListItemPrefix>
                                        {item.icon}
                                    </ListItemPrefix>
                                    {item.name}
                                </ListItem>
                            </Link>
                        ))}
                    </List>
                    <div className="mt-auto">
                        <Alert open={openAlert} onClose={() => setOpenAlert(false)}>
                            <Typography variant="h6" className="mb-1">
                                GLAMIS - Notify
                            </Typography>
                            <Typography variant="small" className="font-normal opacity-80">
                                🚀 We have 4 modules live for v1 ! Accelrate your career with this software. 🌟💼
                            </Typography>
                            <div className="mt-4 flex gap-3">
                                <Typography
                                    as="a"
                                    href="#"
                                    variant="small"
                                    className="font-medium opacity-80"
                                    onClick={() => setOpenAlert(false)}
                                >
                                    Dismiss
                                </Typography>
                            </div>
                        </Alert>
                        <div className="my-3">
                            <div className="flex justify-between items-center gap-2 px-2">
                                <div className="flex items-center gap-2 my-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png" alt="profile" className="h-8 w-8 rounded-full border-green-600 border-2" />
                                    <div>
                                        <Typography color="blue-gray" className="font-semibold ml-2">
                                            {Cookies.get("fullName")}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <Typography color="blue-gray" className="mx-1 font-semibold p-3 flex justify-center items-center rounded-full bg-gray-300 text-gray-900 h-4 w-4">
                                        <span className="">
                                            {tokenLeft}
                                        </span>
                                    </Typography>
                                    <img width="32" height="32" className="mx-1" src="https://img.icons8.com/fluency/48/stack-of-coins--v1.png" alt="stack-of-coins--v1" />
                                </div>
                                {/* show token 3 */}
                            </div>
                            <Button
                                color="#2b6030"
                                className="w-full"
                                variant="outlined"
                                block={true}
                                ripple="light"
                                onClick={() => {
                                    Cookies.remove("accessToken");
                                    navigate("/login");
                                    toast.success("Logout Successfully")
                                }}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
            {!isSidebarOpen && (
                <UisBars className="ml-4 mt-4 cursor-pointer" onClick={() => setIsSidebarOpen(true)} />
            )}
        </div>
    );
}
