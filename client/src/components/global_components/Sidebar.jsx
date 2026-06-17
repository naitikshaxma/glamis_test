import React from "react";
import { Card, Typography, List, ListItem, ListItemPrefix, Alert, Button } from "@material-tailwind/react";
import { UserCircleIcon, InboxIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import { UisBars } from '@iconscout/react-unicons-solid';
import { SidebarContext } from "../../hooks/SideBarContextHook";


import avatar from "../../assets/avatar.jpeg";
import Cookies from "js-cookie";
import { useRecoilState } from "recoil";
import { tokenState } from "../../store/atoms/token";
import { toast } from "react-toastify";
import axios from "axios";



export default function Sidebar() {

    const navigate = useNavigate();
    const [tokenLeft, setTokenLeft] = useRecoilState(tokenState);
    const [userAvatar, setUserAvatar] = React.useState('');

    React.useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/get-user-data-profile`, {}, {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('accessToken')}`
                    }
                });
                if (response.data?.data) {
                    setTokenLeft(response.data.data.token);
                    setUserAvatar(response.data.data.avatar || '');
                }
            } catch (err) {
                console.error("Error fetching token left in Sidebar:", err);
            }
        };
        fetchToken();
    }, [setTokenLeft]);

    const getAvatarSrc = () => {
        if (userAvatar && userAvatar !== 'path/to/avatar.png') {
            return `${import.meta.env.VITE_BACKEND_URL}${userAvatar}`;
        }
        return 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
    };
    const [openAlert, setOpenAlert] = React.useState(true);
    const { isOpen, toggleSidebar } = React.useContext(SidebarContext);
    const location = useLocation();
    const isActive = (href) => location.pathname === href;


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
    },
    {
        name: 'Our Team',
        icon: <InboxIcon className="h-5 w-5" />,
        href: '/team'
    },

    ]

    return (
        <>
            <Card className={`w-full max-w-[20rem] h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
                {/* Brand Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <img src="https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png" alt="GLAMIS" className="h-9 w-9" />
                        <div>
                            <Typography variant="h5" className="font-bold text-gray-800 leading-tight">
                                GLAMIS
                            </Typography>
                            <Typography variant="small" className="text-gray-500 text-xs font-medium tracking-wide">
                                Student Portal
                            </Typography>
                        </div>
                    </div>
                    <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-800 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>

                {/* Navigation List */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <List className="p-0 gap-1">
                        {navItems.map((item, index) => (
                            <Link to={item.href} key={index}>
                                <ListItem className={`rounded-lg text-sm py-2.5 ${
                                    isActive(item.href)
                                        ? "border-l-4 border-green-700 bg-green-50 text-green-800 font-semibold"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-l-4 border-transparent"
                                }`}>
                                    <ListItemPrefix>
                                        <span className={isActive(item.href) ? "text-green-700" : "text-gray-400"}>
                                            {item.icon}
                                        </span>
                                    </ListItemPrefix>
                                    {item.name}
                                </ListItem>
                            </Link>
                        ))}
                    </List>
                </nav>

                {/* Bottom Alert and Profile Section */}
                <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/50">
                    {openAlert && (
                        <Alert open={openAlert} onClose={() => setOpenAlert(false)} className="mb-4 bg-gray-950 text-white rounded-xl p-4">
                            <Typography variant="h6" className="mb-1 text-sm font-bold text-white">
                                GLAMIS - Notify
                            </Typography>
                            <Typography variant="small" className="font-normal opacity-85 text-xs text-white">
                                🚀 We have 4 modules live for v1 ! Accelrate your career with this software. 🌟💼
                            </Typography>
                            <div className="mt-2 flex gap-3">
                                <button
                                    className="font-semibold text-xs opacity-90 text-white underline hover:opacity-100"
                                    onClick={() => setOpenAlert(false)}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </Alert>
                    )}

                    <div className="border-t border-gray-100/10 pt-2">
                        <div className="flex justify-between items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <img src={getAvatarSrc()} alt="profile" className="h-9 w-9 rounded-full border-green-600 border-2 object-cover" />
                                <div className="flex-1 min-w-0">
                                    <Typography className="font-semibold text-sm text-gray-800 truncate max-w-[7rem]">
                                        {Cookies.get("fullName")}
                                    </Typography>
                                    <Typography className="text-[10px] text-gray-400 font-medium">
                                        Student
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                                <Typography className="text-xs font-bold text-gray-800 leading-none">
                                    {tokenLeft}
                                </Typography>
                                <img width="20" height="20" src="https://img.icons8.com/fluency/48/stack-of-coins--v1.png" alt="coins" className="object-contain" />
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outlined"
                            color="red"
                            className="w-full text-xs py-2 rounded-lg"
                            onClick={() => {
                                Cookies.remove("accessToken");
                                navigate("/login");
                                toast.success("Logout Successfully");
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </Card>
        </>
}
