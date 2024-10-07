import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
const MainLayout = ({ children }) => (
    <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{
            flex: 1,
            marginLeft: '20rem'
        }}>
            {children}
        </div>
    </div>
);

const App = () => {
    return (
        <Router>
            <Routes>
                {/* <Route path="/admin" element={<AdminSignup />} /> */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/schedule/company" element={<ProtectedRoute><MainLayout><CompanyInterview /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/schedule/written" element={<ProtectedRoute><MainLayout><WrittenInterview /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/schedule/subject" element={<ProtectedRoute><MainLayout><SubjectInterview /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/schedule/verbal" element={<ProtectedRoute><MainLayout><VerbalInterview /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/schedule/svar" element={<ProtectedRoute><MainLayout><SwarInterview /></MainLayout></ProtectedRoute>} />
                <Route path="/admin/review-board" element={<ProtectedRoute><MainLayout><ReviewBoard /></MainLayout></ProtectedRoute>} />
                <Route path="*" element={<div className="w-full h-screen flex justify-center items-center bg-gray-900 text-white">
                    <h1>404 Not Found</h1>
                </div>} />
            </Routes>
        </Router>
    );
};

export default App;
