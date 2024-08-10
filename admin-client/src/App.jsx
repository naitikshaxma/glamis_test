import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminSignup from "./pages/AdminSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ReviewBoard from "./components/dashboard/ReviewBoard";
import Sidebar from "./components/globalComponents/Sidebar";
import ScheduleInterview from "./components/dashboard/ScheduleInterview";

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
                <Route path="/admin" element={<AdminSignup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<MainLayout><AdminDashboard /></MainLayout>} />
                <Route path="/admin/schedule" element={<MainLayout><ScheduleInterview /></MainLayout>} />
                <Route path="/admin/review-board" element={<MainLayout><ReviewBoard /></MainLayout>} />
            </Routes>
        </Router>
    );
};

export default App;
