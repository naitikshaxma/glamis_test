import React, { useState } from 'react';
import Sidebar from '../components/global_components/Sidebar';
import ProfilePage from './Profile';
import Interviews from './Interviews';
import DashboardContent from './DashboardContent';
import Result from './Result';
import History from './History';


const Dashboard = () => {
    const [activeLink, setActiveLink] = useState('Dashboard');

    const handleSidebarLinkClick = (link) => {
        setActiveLink(link);
    };

    const renderContent = () => {
        switch (activeLink) {
            case 'Profile':
                return <ProfilePage />;
            case 'Upcoming Interviews':
                return <Interviews />;
            case 'History':
                return <History />;
            case 'Result':
                return <Result />;
            default:
                return <DashboardContent />;
        }
    };

    return (
        <div className="flex h-screen">
            <Sidebar onLinkClick={handleSidebarLinkClick} activeLink={activeLink} />
            <div className="flex-grow p-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;
