import React from "react";
import { Card, Typography, List, ListItem, ListItemPrefix, Alert, Button } from "@material-tailwind/react";
import { UserCircleIcon, InboxIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { UisBars } from '@iconscout/react-unicons-solid';
import { ChevronDownIcon, ChevronRightIcon, PresentationChartBarIcon } from "@heroicons/react/24/outline";
import { Accordion, AccordionBody, AccordionHeader } from "@material-tailwind/react";

import avatar from "../../assets/avatar.jpeg";
import Cookies from "js-cookie";

export default function Sidebar() {

  const [open, setOpen] = React.useState(0);
  const handleOpen = (index) => {
    open === index ? setOpen(0) : setOpen(index);
  };

  const navigate = useNavigate();
  const [openAlert, setOpenAlert] = React.useState(true);
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
      href: '/profile'
    },
    {
      name: "Review Board",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>,
      href: "/admin/review-board"
    },
  ];

  return (
    <div className="flex">
      {isSidebarOpen && (
        <Card className="w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 h-screen fixed top-0 left-0 bg-white flex flex-col">
          <div className="mb-2 flex items-center gap-4 p-4">
            <img src="https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png" alt="GLAMIS" className="h-8 w-8" />
            <div className="flex flex-col">
              <Typography variant="h5" color="blue-gray">
                GLAMIS
              </Typography>
              <Typography variant="small" color="blue-gray">
                Admin
              </Typography>
            </div>
            <UisBars className="ml-20 cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
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

          <List>
            <Accordion
              open={open === 1}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`}
                />
              }
            >
              <ListItem className="p-0">
                <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3">
                  <ListItemPrefix>
                    <PresentationChartBarIcon className="h-5 w-5" />
                  </ListItemPrefix>
                  <Typography color="blue-gray" className="mr-auto font-normal">
                    Schedule Interview
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  <Link to="/admin/schedule">
                    <ListItem>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Company Mock Interview
                    </ListItem>
                  </Link>
                  <Link to="/admin/schedule">
                    <ListItem>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Interview By Subject
                    </ListItem>
                  </Link>
                  <Link to="/admin/schedule">
                    <ListItem>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Written SKills
                    </ListItem>
                  </Link>
                  <Link to="/admin/schedule">
                    <ListItem>
                      <ListItemPrefix>
                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                      </ListItemPrefix>
                      Verbal SKills
                    </ListItem>
                  </Link>
                </List>
              </AccordionBody>
            </Accordion>
            <Accordion
              open={open === 2}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`}
                />
              }
            >
              {/* Add content here if needed */}
            </Accordion>
          </List>
          <div className="mt-auto">
            <Alert open={openAlert} onClose={() => setOpenAlert(false)}>
              <Typography variant="h6" className="mb-1">
                GLAMIS - Notify
              </Typography>
              <Typography variant="small" className="font-normal opacity-80">
                🚀 Dear admin, You can now schedule an Interview in just 5 mins 🌟💼
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
                  <img src={avatar} alt="profile" className="h-8 w-8 rounded-full border-green-600 border-2" />
                  <div>
                    <Typography color="blue-gray" className="font-semibold ml-2">
                      Demo Admin
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <Typography color="blue-gray" className="mx-1 font-semibold p-3 flex justify-center items-center rounded-full bg-gray-300 text-gray-900 h-4 w-4">
                    <span className="">
                      3
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
                  // Cookies.remove("accessToken");
                  // navigate("/login");
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
