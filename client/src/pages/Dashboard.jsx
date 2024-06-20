
import React from 'react'
import Sidebar from '../components/global_components/Sidebar'
import MyInterview from './Interviews'
import ProfilePage from './Profile';
import Interviews from './Interviews';
import DashboardContent from './DashboardContent';
import Result from './Result';
import History from './History';
import { useNavigate } from 'react-router-dom';


import { useState } from 'react';
const Dashboard = () => {
    return (

        <div className="flex h-screen">
            {/* <Sidebar onLinkClick={handleSidebarLinkClick} activeLink={activeLink} /> */}
            <div className="flex-grow p-4">
                {/* {renderContent()} */}
            </div>
        </div>
    );
};

export default Dashboard;
