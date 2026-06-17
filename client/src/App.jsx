import { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
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
import SystemCheck from "./pages/SystemCheck";
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
import { SidebarContext } from "./hooks/SideBarContextHook";
import logo from "./assets/logo.png";



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
// eslint-disable-next-line react/prop-types
const MainLayout = ({ children }) => {
    const { isOpen, toggleSidebar } = useContext(SidebarContext);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Profile', href: '/profile' },
        { name: 'My Interviews', href: '/myInterview' },
        { name: 'History', href: '/history' },
        { name: 'Feedback', href: '/feedback' },
        { name: 'Our Team', href: '/team' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'ml-[16.5rem]' : 'ml-0'}`}>
                {!isOpen && (
                    <div className="h-16 px-6 bg-white shadow-sm flex items-center justify-between border-b border-gray-200 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={toggleSidebar}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="GLAMIS Logo" className="h-9 w-9 object-contain" />
                                <div className="text-left">
                                    <h2 className="font-bold text-gray-800 leading-tight text-sm">
                                        GLAMIS
                                    </h2>
                                    <p className="text-gray-500 text-[10px] font-medium tracking-wide">
                                        Student Portal
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Horizontal Nav Links */}
                        <div className="flex items-center gap-1">
                            {navItems.map((item, idx) => (
                                <Link 
                                    to={item.href} 
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                        isActive(item.href) 
                                            ? 'bg-green-50 text-green-700 font-semibold' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
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
