import React, { useState } from "react";
import {createBrowserRouter, Outlet, RouterProvider, Link, useLocation} from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ReviewBoard from "./components/dashboard/ReviewBoard";
import Sidebar from "./components/globalComponents/Sidebar";
import CompanyInterview from "./components/dashboard/scheduleInterview/CompanyInterview";
import SubjectInterview from "./components/dashboard/scheduleInterview/SubjectInterview";
import WrittenInterview from "./components/dashboard/scheduleInterview/WrittenInterview";
import VerbalInterview from "./components/dashboard/scheduleInterview/VerbalInterview";
import ProtectedRoute from "./pages/Protectedroute";
import SwarInterview from "./components/dashboard/scheduleInterview/SwarInterview";
import {Toaster} from 'react-hot-toast';
import AdminProfile from "./pages/AdminProfile";

// Layout component that includes Sidebar
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isScheduleActive = location.pathname.startsWith('/admin/schedule');

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-[16.5rem]' : 'ml-0'}`}>
        
        {/* Top Navbar appears ONLY when sidebar is closed */}
        {!isSidebarOpen && (
          <div className="h-16 px-6 bg-white shadow-sm flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">Admin Panel</h2>
            </div>
            
            {/* Horizontal Nav Links */}
            <div className="flex items-center gap-1 ml-8">
              <Link to="/admin/dashboard" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive('/admin/dashboard') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Dashboard
              </Link>
              <Link to="/admin/profile" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive('/admin/profile') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Profile
              </Link>
              <Link to="/admin/review-board" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive('/admin/review-board') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Review Board
              </Link>
              
              {/* Dropdown for Schedule Interview */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${isScheduleActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  Schedule Interview
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link to="/admin/schedule/company" className={`block px-4 py-2 text-sm ${isActive('/admin/schedule/company') ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Company Mock</Link>
                    <Link to="/admin/schedule/subject" className={`block px-4 py-2 text-sm ${isActive('/admin/schedule/subject') ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Subject Based</Link>
                    <Link to="/admin/schedule/written" className={`block px-4 py-2 text-sm ${isActive('/admin/schedule/written') ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Written Skills</Link>
                    <Link to="/admin/schedule/verbal" className={`block px-4 py-2 text-sm ${isActive('/admin/schedule/verbal') ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Verbal Skills</Link>
                    <Link to="/admin/schedule/svar" className={`block px-4 py-2 text-sm ${isActive('/admin/schedule/svar') ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>Svar</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

// Define your routes using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/admin/login",
    element: <AdminLogin/>,
  },
  {
    element: <ProtectedRoute/>,
    children: [
      {
        element: <MainLayout/>,
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard/>,
          },
          {
            path: "/admin/profile",
            element: <AdminProfile/>,
          },
          {
            path: "/admin/schedule/company",
            element: <CompanyInterview/>,
          },
          {
            path: "/admin/schedule/written",
            element: <WrittenInterview/>,
          },
          {
            path: "/admin/schedule/subject",
            element: <SubjectInterview/>,
          },
          {
            path: "/admin/schedule/verbal",
            element: <VerbalInterview/>,
          },
          {
            path: "/admin/schedule/svar",
            element: <SwarInterview/>,
          },
          {
            path: "/admin/review-board",
            element: <ReviewBoard/>,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="w-full h-screen flex justify-center items-center bg-gray-900 text-white">
        <h1>404 Not Found</h1>
      </div>
    ),
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router}/>
      <Toaster position={'top-right'}/>
    </>
  );
};

export default App;
