import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Interviews from "./pages/Interviews";
import Sidebar from "./components/global_components/Sidebar";
import Result from "./pages/Result";
import LiveInterview from "./pages/LiveInterview";

// Layout component that includes Sidebar
const MainLayout = ({ children }) => (
    <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1 ,
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Signup />} />
                <Route 
                    path="/dashboard" 
                    element={<MainLayout><Dashboard /></MainLayout>} 
                />
                <Route 
                    path="/myInterview" 
                    element={<MainLayout><Interviews /></MainLayout>} 
                />
                <Route 
                    path="/profile" 
                    element={<MainLayout><Profile /></MainLayout>} 
                />
                <Route 
                    path="/history" 
                    element={<MainLayout><History /></MainLayout>} 
                />
                <Route
                    path="/live"
                    element={<LiveInterview />}
                />
            </Routes>
        </Router>
    );
};

export default App;
