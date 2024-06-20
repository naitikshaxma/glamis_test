import React from "react";
import { Link } from "react-router-dom";
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Chip,
    Accordion,
    AccordionHeader,
    AccordionBody,
    Alert,
} from "@material-tailwind/react";
import {
    PresentationChartBarIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    InboxIcon,
    PowerIcon,
} from "@heroicons/react/24/solid";
import {
    ChevronRightIcon,
    ChevronDownIcon,
    CubeTransparentIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ onLinkClick, activeLink }) {
    const [open, setOpen] = React.useState(0);
    const [openAlert, setOpenAlert] = React.useState(true);

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    const handleItemClick = (link) => {
        onLinkClick(link);
    };

    return (
        <Card className="w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 h-screen">
            <div className="mb-2 flex items-center gap-4 p-4">
                <img src="https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png" alt="GLAMIS" className="h-8 w-8" />
                <Typography variant="h5" color="blue-gray">
                    GLAMIS
                </Typography>
            </div>
            <List>
                <ListItem className={activeLink === 'Dashboard' ? 'bg-gray-300' : '' } onClick={() => handleItemClick('Dashboard')}>
                    <ListItemPrefix>
                        <InboxIcon className="h-5 w-5" />
                    </ListItemPrefix>
                    Dashboard
                </ListItem>
                <ListItem className={activeLink === 'Profile' ? 'bg-gray-300' : ''} onClick={() => handleItemClick('Profile')}>
                    <ListItemPrefix>
                        <UserCircleIcon className="h-5 w-5" />
                    </ListItemPrefix>
                    Profile
                </ListItem>
                
                <ListItem 
                onClick={()=>{
                onLinkClick('myInterview')
            }}
                >
                    <ListItemPrefix>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                        </svg>
                    </ListItemPrefix>
                    My Interviews
                    <ListItemSuffix>
                        <Chip value="14" size="sm" variant="ghost" color="green" className="rounded-full" />
                    </ListItemSuffix>
                </ListItem>
                <ListItem className={activeLink === 'History' ? 'bg-gray-300' : ''} onClick={() => handleItemClick('History')}>
                    <ListItemPrefix>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </ListItemPrefix>
                    History
                </ListItem>
                <ListItem className={activeLink === 'Result' ? 'bg-gray-300' : ''} onClick={() => handleItemClick('Result')}>
                    <ListItemPrefix>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                    </ListItemPrefix>
                    Result
                </ListItem>
            </List>
        </Card>
    );
}
