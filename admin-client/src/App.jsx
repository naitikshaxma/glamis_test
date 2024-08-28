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
                <Route path="/admin/schedule/company" element={<MainLayout><CompanyInterview /></MainLayout>} />
                <Route path="/admin/schedule/written" element={<MainLayout><WrittenInterview /></MainLayout>} />
                <Route path="/admin/schedule/subject" element={<MainLayout><SubjectInterview /></MainLayout>} />
                <Route path="/admin/schedule/verbal" element={<MainLayout><VerbalInterview /></MainLayout>} />
                <Route path="/admin/review-board" element={<MainLayout><ReviewBoard /></MainLayout>} />
            </Routes>
        </Router>
    );
};

export default App;
