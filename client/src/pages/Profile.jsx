import React, { useEffect, useState } from 'react';
import PersonalDetails from '../components/profile/PersonalDetails';
import EducationalDetails from '../components/profile/EducationsDetails';
import Resume from '../components/profile/Resume';
import axios from 'axios';
import Cookies from 'js-cookie'; 

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [userData, setUserData] = useState({});

    const getUserData = async () => {
        console.log("In here")
        try{ 
            console.log("Before request")
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/get-user-data-profile`, {},

                {
                    headers: {

                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get('accessToken')}`
                    }
                }
            );
            console.log(response)
            setUserData(response.data.data);  
            return; 
    } catch(err) {
        console.log(err); 
    }

    }

    useEffect(() => {
        console.log("Calling user data")
        getUserData(); // get user data
        // console.log(userData)
    }, [])

    const renderContent = () => {
        switch (activeTab) {
            case 'personal':
                return <PersonalDetails name={userData.user?.name || ''} emailId={userData.user?.email_id || ''} phoneNo={userData.user?.phone || ''} address={userData.address || ''} rollNo={userData.rollNo || ''} />;
            case 'education':
                return <EducationalDetails semester={userData.semester || ''} section={userData.section || ''} course={userData.course || ''} branch={userData.branch} />;
            case 'resume':
                return <Resume />;
            default:
                return <PersonalDetails />;
        }
    };

    return (
        <div className="flex flex-col w-full p-6 shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Profile</h1>
            <div className="flex border-b mb-6">
                <button
                    className={`py-2 px-4 ${activeTab === 'personal' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('personal')}
                >
                    Personal Details
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'education' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('education')}
                >
                    Educational Details
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'resume' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('resume')}
                >
                    Resume
                </button>
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ProfilePage;
