
import React from 'react'
import Sidebar from '../components/global_components/Sidebar'
import MyInterview from './MyInterview'
import ProfilePage from './Profile';


const Dashboard = () => {
    const [activeLink, setActiveLink] = useState('profile');

    const handleSidebarLinkClick = (link) => {
        setActiveLink(link);
    };

    return (

        <div className="flex h-screen">
            <Sidebar onLinkClick={handleSidebarLinkClick} activeLink={activeLink} />
            <ProfilePage activeLink={activeLink} />
        </div>
    );
};

export default Dashboard;
