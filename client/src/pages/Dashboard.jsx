
import React from 'react'
import Sidebar from '../components/global_components/Sidebar'
import MyInterview from './MyInterview'
import ProfilePage from './Profile';

import { useState } from 'react';
const Dashboard = () => {
    const [activeLink, setActiveLink] = useState('profile');

    const handleSidebarLinkClick = (link) => {
        setActiveLink(link);
    };

    return (

        <div className="flex h-screen">
            <Sidebar onLinkClick={handleSidebarLinkClick} activeLink={activeLink} />
            {/* {activeLink === 'profile' ? <ProfilePage activeLink={activeLink} /> : */}
             <MyInterview activeLink={activeLink} />
        </div>
    );
};

export default Dashboard;
