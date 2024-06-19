import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/Login";
// import EnterOTP from "./pages/EnterOTP";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Signup />} />
                {/* <Route path="/enter-otp" element={<EnterOTP />} /> */}
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
};

export default App;
