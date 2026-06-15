import React from "react";
import { Card, Typography, List, ListItem, ListItemPrefix, Button } from "@material-tailwind/react";
import { UserCircleIcon, InboxIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon, PresentationChartBarIcon } from "@heroicons/react/24/outline";
import { Accordion, AccordionBody, AccordionHeader } from "@material-tailwind/react";
import { toast } from "react-hot-toast";

import avatar from "../../assets/avatar.jpeg";
import Cookies from "js-cookie";
import axios from "axios";

export default function Sidebar() {
  const [adminName, setAdminName] = React.useState("Loading...");
  const [sidebarAvatar, setSidebarAvatar] = React.useState(
    localStorage.getItem('adminAvatar') || avatar
  );

  React.useEffect(() => {
    const handleStorageChange = () => {
      const updated = localStorage.getItem('adminAvatar');
      if (updated) setSidebarAvatar(updated);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const location = useLocation();

  React.useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = Cookies.get('accessTokenAdmin');
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminName(res.data.name);
      } catch (error) {
        console.error("Failed to fetch admin info", error);
        setAdminName("Admin");
      }
    };
    fetchAdminProfile();
  }, []);

  const [open, setOpen] = React.useState(0);
  const handleOpen = (index) => {
    open === index ? setOpen(0) : setOpen(index);
  };

  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    {
      name: 'Dashboard',
      icon: <InboxIcon className="h-5 w-5" />,
      href: '/admin/dashboard'
    },
    {
      name: 'Profile',
      icon: <UserCircleIcon className="h-5 w-5" />,
      href: '/admin/profile'
    },
    {
      name: "Review Board",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>,
      href: "/admin/review-board"
    },
  ];

  const scheduleSubItems = [
    { name: "Company Mock", href: "/admin/schedule/company" },
    { name: "Subject Based", href: "/admin/schedule/subject" },
    { name: "Written Skills", href: "/admin/schedule/written" },
    { name: "Verbal Skills", href: "/admin/schedule/verbal" },
    { name: "Svar", href: "/admin/schedule/svar" },
  ];

  const isActive = (href) => location.pathname === href;
  const isScheduleActive = location.pathname.startsWith("/admin/schedule");

  // Auto-open accordion if on a schedule page
  React.useEffect(() => {
    if (isScheduleActive) setOpen(1);
  }, [isScheduleActive]);

  return (
    <div className="flex">
      {isSidebarOpen && (
        <div className="w-full max-w-[16.5rem] h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col z-40">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <img src="https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png" alt="GLAMIS" className="h-9 w-9" />
            <div>
              <Typography variant="h5" className="font-bold text-gray-800 leading-tight">
                GLAMIS
              </Typography>
              <Typography variant="small" className="text-gray-500 text-xs font-medium tracking-wide">
                Admin Panel
              </Typography>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <Typography variant="small" className="text-gray-400 font-semibold text-[11px] uppercase tracking-wider px-3 mb-2">
              Main
            </Typography>
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

            <Typography variant="small" className="text-gray-400 font-semibold text-[11px] uppercase tracking-wider px-3 mt-5 mb-2">
              Actions
            </Typography>
            <List className="p-0">
              <Accordion
                open={open === 1}
                icon={
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 text-gray-400 transition-transform ${open === 1 ? "rotate-180" : ""}`}
                  />
                }
              >
                <ListItem className={`p-0 rounded-lg ${isScheduleActive ? "bg-green-50" : ""}`}>
                  <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3">
                    <ListItemPrefix>
                      <PresentationChartBarIcon className={`h-5 w-5 ${isScheduleActive ? "text-green-700" : "text-gray-400"}`} />
                    </ListItemPrefix>
                    <Typography className={`mr-auto font-normal text-sm ${isScheduleActive ? "text-green-800 font-semibold" : "text-gray-600"}`}>
                      Schedule Interview
                    </Typography>
                  </AccordionHeader>
                </ListItem>
                <AccordionBody className="py-1">
                  <List className="p-0 pl-4">
                    {scheduleSubItems.map((sub, idx) => (
                      <Link to={sub.href} key={idx}>
                        <ListItem className={`rounded-lg text-xs py-2 ${
                          isActive(sub.href)
                            ? "text-green-700 font-semibold bg-green-50"
                            : "text-gray-500 hover:text-green-700 hover:bg-gray-50"
                        }`}>
                          <ListItemPrefix>
                            <ChevronRightIcon strokeWidth={3} className="h-3 w-3" />
                          </ListItemPrefix>
                          {sub.name}
                        </ListItem>
                      </Link>
                    ))}
                  </List>
                </AccordionBody>
              </Accordion>
            </List>
          </nav>

          {/* Bottom: Admin Profile + Logout */}
          <div className="border-t border-gray-100 px-4 py-4">
            <div className="flex items-center gap-3 mb-3 px-1">
              <img src={sidebarAvatar} alt="profile" className="h-9 w-9 rounded-full border-2 border-green-600 object-cover" />
              <div className="flex-1 min-w-0">
                <Typography className="font-semibold text-sm text-gray-800 truncate">
                  {adminName}
                </Typography>
                <Typography className="text-xs text-gray-400">
                  Administrator
                </Typography>
              </div>
            </div>
            <Button
              size="sm"
              variant="outlined"
              color="red"
              className="w-full text-xs py-2 rounded-lg"
              onClick={() => {
                Cookies.remove("accessTokenAdmin");
                toast.success("Logout Successfully")
                navigate("/admin/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
