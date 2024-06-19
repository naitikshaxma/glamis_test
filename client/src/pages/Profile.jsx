import React, { useState } from 'react';
import PersonalDetails from '../components/profile/PersonalDetails';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('personal');

    const renderContent = () => {
        switch (activeTab) {
            case 'personal':
                return <PersonalDetails />;
            case 'education':
                return <EducationalDetails />;
            case 'resume':
                return <Resume />;
            default:
                return <PersonalDetails />;
        }
    };

    return (
        <div className="flex flex-col w-full p-6 bg-white shadow-md rounded-lg">
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

// const PersonalDetails = () => (
//     <div>
//         <h2 className="text-xl font-semibold mb-2">Personal Details</h2>
//         <p>Here are the personal details...</p>
//     </div>
// );

const EducationalDetails = () => (
    <div>
        <h2 className="text-xl font-semibold mb-2">Educational Details</h2>
        <p>Here are the educational details...</p>
    </div>
);

const Resume = () => (
    <div>
        <h2 className="text-xl font-semibold mb-2">Resume</h2>
        <p>Here is the resume...</p>
    </div>
);

export default ProfilePage;
