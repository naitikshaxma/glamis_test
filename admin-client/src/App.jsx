import React from "react";
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import AdminSignup from "./pages/AdminSignup";
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

// Layout component that includes Sidebar
const MainLayout = () => (
  <div className='flex'>
    <Sidebar/>
    <div className='flex-1 ml-80'>
      <Outlet/>
    </div>
  </div>
);

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
  ]
);

const App = () => {
  return (
    <RouterProvider router={router}/>
  );
};

export default App;
