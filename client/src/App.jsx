import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EnterOTP from "./pages/EnterOTP";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<SignupPage />} />
                <Route path="/enter-otp" element={<EnterOTP />} />
            </Routes>
        </Router>
    );
};

export default App;
