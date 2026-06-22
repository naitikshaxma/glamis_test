import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/dashboards/Dashboard.jsx";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Interviews from "./pages/Interviews";
import MainLayout from "./components/global_components/MainLayout";
import LiveInterview from "./pages/LiveInterview";
import EvaluationResult from "./pages/EvaluationResult";
import CreateInterview from "./pages/CreateInterview";
import SystemCheck from "./pages/SystemCheck";
import InterviewLobby from "./pages/InterviewLobby";
import InterviewReview from "./pages/InterviewReview";
import { resultPopupState } from "./store/atoms/resultPopup";
import { useRecoilValue } from "recoil";
import Result from "./pages/Result";
import DetailedReport from "./pages/DetailedReport";
import Otp from "./pages/Otp";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WrittenInterview from "./pages/WrittenInterview";
import WrittenReport from "./pages/WrittenReport";
import Feedback from "./pages/Feedback";
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

const App = () => {


    useEffect(() => {
        const handleKeyDown = (e) => {
            const ev = e || window.event;
            if (!ev) return;
            if (ev.ctrlKey && (ev.keyCode === 73 || ev.keyCode === 85)) {
                ev.preventDefault();
                return false;
            }
            // disable F12 key
            if (ev.keyCode === 123) {
                ev.preventDefault();
                return false;
            }
        };

        const handleContextMenu = (e) => {
            e.preventDefault(); // Prevents the context menu from appearing
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
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
                    element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>}

                />
                <Route
                    path="/myInterview"
                    element={<ProtectedRoute><MainLayout><Interviews /></MainLayout></ProtectedRoute>}
                />
                <Route
                    path="/create-interview"
                    element={<ProtectedRoute><MainLayout><CreateInterview /></MainLayout></ProtectedRoute>}
                />
                <Route
                    path="/system-check"
                    element={<ProtectedRoute><SystemCheck /></ProtectedRoute>}
                />
                {/* Pre-interview flow: locked, fullscreen lobby then config review.
                    No interview logic runs until the final Start on the review screen. */}
                <Route
                    path="/interview/lobby"
                    element={<ProtectedRoute><InterviewLobby /></ProtectedRoute>}
                />
                <Route
                    path="/interview/review"
                    element={<ProtectedRoute><InterviewReview /></ProtectedRoute>}
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
                    element={<ProtectedRoute>
                        <MainLayout><DetailedReport /></MainLayout>
                    </ProtectedRoute>
                    }
                />
                <Route
                    path="/history/detailed/:id"
                    element={<ProtectedRoute>
                        <MainLayout><DetailedReport /></MainLayout>
                    </ProtectedRoute>
                    }
                />
                <Route path="/history/detailed-written" element={<ProtectedRoute><MainLayout><WrittenReport /></MainLayout></ProtectedRoute>} />
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
                    element={<ProtectedRoute><MainLayout><Team /></MainLayout></ProtectedRoute>}

                />

                <Route path="/dashboard/company" element={<ProtectedRoute><MainLayout><CompanyDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/dashboard/subject" element={<ProtectedRoute><MainLayout><SubjectDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/dashboard/svar" element={<ProtectedRoute><MainLayout><SvarDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/dashboard/written" element={<ProtectedRoute><MainLayout><WrittenDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/dashboard/verbal" element={<ProtectedRoute><MainLayout><VerbalDashboard /></MainLayout></ProtectedRoute>} />


            </Routes>
            <ToastContainer />
        </Router>
    );
};

export default App;
