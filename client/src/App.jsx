import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
    // a function for disable the inspect panel
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
                    element={<MainLayout><History />
                        {
                            resultPopup && <Result />
                        }

                    </MainLayout>}
                />
                <Route
                    path="/history/detailed"
                    element={
                        <DetailedReport />
                    }
                />
                <Route
                    path="/history/detailed/:id"
                    element={
                        <DetailedReport />
                    }
                />
                <Route
                    path="/live"
                    element={<LiveInterview />}
                />
                <Route
                    path="/evaluation"
                    element={<EvaluationResult data={response.data} />}
                />
                <Route
                    path="/interview/create"
                    element={<CreateInterview />}
                />
            </Routes>
        </Router>
    );
};

export default App;
