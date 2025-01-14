import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/dashboards/Dashboard.jsx";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Interviews from "./pages/Interviews";
import Sidebar from "./components/global_components/Sidebar";
import LiveInterview from "./pages/LiveInterview";
import EvaluationResult from "./pages/EvaluationResult";
import CreateInterview from "./pages/CreateInterview";
import { resultPopupState } from "./store/atoms/resultPopup";
import { useRecoilValue } from "recoil";
import Result from "./pages/Result";
import DetailedReport from "./pages/DetailedReport";
import Otp from "./pages/Otp";
import { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WrittenInterview from "./pages/WrittenInterview";
import WrittenReport from "./pages/WrittenReport";
import Feedback from "./pages/Feedback";
import Cookies from 'js-cookie';
import ProtectedRoute from "./pages/Protectedroute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Team from "./pages/Team";
import CompanyDashboard from './pages/dashboards/CompanyDashboard.jsx';
import SubjectDashboard from './pages/dashboards/SubjectDashboard.jsx';
import SvarDashboard from './pages/dashboards/SvarDashboard.jsx';
import WrittenDashboard from "./pages/dashboards/WrittenDashboard.jsx";
import VerbalDashboard from "./pages/dashboards/VerbalDashboard.jsx";



const response = {
    statusCode: 200,
    data: {
        score: 10,
        explanation: "The answer provided is merely a repetition of the question without providing any actual information about the advantages and disadvantages of using hash tables. It lacks depth and substance required in a comprehensive answer."
    },
    message: "Answer evaluated successfully",
    success: true
};

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

    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    document.onkeydown = function (e) {
        if (e.ctrlKey && (e.keyCode === 73 || e.keyCode === 85)) {
            return false;
        }
        // disable F12 key
        if (e.keyCode === 123) {
            return false;
        }
        //disable right click
        if (e.button == 2) {
            return false;
        }
    }
    useEffect(() => {
        // Function to disable right-click
        const handleContextMenu = (e) => {
            e.preventDefault(); // Prevents the context menu from appearing
        };

        // Attach the event listener to the document
        document.addEventListener('contextmenu', handleContextMenu);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);
    const resultPopup = useRecoilValue(resultPopupState);
    return (

        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Signup />} />
                <Route path="/account/verification" element={<Otp />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/reset" element={<ResetPassword />} />
                <Route
                    path="/dashboard"
                    element={ <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>}

                />
                <Route
                    path="/myInterview"
                    element={<ProtectedRoute><MainLayout><Interviews /></MainLayout></ProtectedRoute>}
                />
                <Route
                    path="/profile"
                    element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>}
                />
                <Route
                    path="/feedback"
                    element={<ProtectedRoute><MainLayout><Feedback /></MainLayout></ProtectedRoute>}
                />
                <Route
                    path="/history"
                    element={<ProtectedRoute><MainLayout><History />
                        {
                            resultPopup && <Result />
                        }

                    </MainLayout></ProtectedRoute>}
                />
                <Route
                    path="/history/detailed"
                    element={ <ProtectedRoute>

                        <DetailedReport />
                    </ProtectedRoute>
                    }
                />
                <Route
                    path="/history/detailed/:id"
                    element={<ProtectedRoute>

                        <DetailedReport />
                    </ProtectedRoute>
                    }
                />
                <Route path="/history/detailed-written" element={<ProtectedRoute><WrittenReport /></ProtectedRoute>} />
                <Route
                    path="/live"
                    element={<LiveInterview />}
                />
                <Route path="/written" element={<ProtectedRoute><WrittenInterview /></ProtectedRoute>} />
                <Route
                    path="/evaluation"
                    element={<ProtectedRoute><EvaluationResult data={response.data} /></ProtectedRoute>}
                />
                {/* 404 not found page */}
                <Route path="*" element={<div className="w-full h-screen flex justify-center items-center bg-gray-900 text-white">
                    <h1>404 Not Found</h1>
                </div>} />
                <Route
                    path="/team"
                    element={ <ProtectedRoute><MainLayout><Team /></MainLayout></ProtectedRoute>}

                />

                <Route path="/dashboard/company" element={<CompanyDashboard />} />
                <Route path="/dashboard/subject" element={<SubjectDashboard />} />
                <Route path="/dashboard/svar" element={<SvarDashboard />} />
                <Route path="/dashboard/written" element={<WrittenDashboard />} />
                <Route path="/dashboard/verbal" element={<VerbalDashboard />} />


            </Routes>
            <ToastContainer />
        </Router>
    );
};

export default App;
