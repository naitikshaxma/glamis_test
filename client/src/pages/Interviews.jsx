import React, { useState } from 'react';
import InterviewCard from '../components/IntervierCard';

const interviews = [
    {
        id: 1,
        title: "React.js Interview | GLA University",
        description: "React.js Interview | GLA University",
        status: "active now",
        date: "12/12/2021",
        time: "12:00 PM",
        duration: "30 min",
    },
    {
        id: 2,
        title: "Golang Interview | GLA University",
        description: "Golang Interview | GLA University",
        status: "active now",
        date: "10/12/2021",
        time: "07:00 PM",
        duration: "30 min",
    },
    {
        id: 3,
        title: "Node.js Interview | GLA University",
        description: "Node.js Interview | GLA University",
        status: "active now",
        date: "15/12/2021",
        time: "02:00 PM",
        duration: "30 min",
    },
    {
        id: 4,
        title: "Java Interview | GLA University",
        description: "Java Interview | GLA University",
        status: "Upcoming Interview",
        date: "20/12/2021",
        time: "11:00 AM",
        duration: "50 min",
    },
    {
        id: 5,
        title: "Python Interview | GLA University",
        description: "Python Interview | GLA University",
        status: "Upcoming Interview",
        date: "25/12/2021",
        time: "09:00 AM",
        duration: "40 min",
    },
    {
        id: 6,
        title: "C++ Interview | GLA University",
        description: "C++ Interview | GLA University",
        status: "Upcoming Interview",
        date: "30/12/2021",
        time: "10:00 AM",
        duration: "45 min",
    },
    {
        id: 7,
        title: "Angular Interview | GLA University",
        description: "Angular Interview | GLA University",
        status: "Past Interview",
        date: "05/12/2021",
        time: "03:00 PM",
        duration: "30 min",
    },
    {
        id: 8,
        title: "Vue.js Interview | GLA University",
        description: "Vue.js Interview | GLA University",
        status: "Past Interview",
        date: "08/12/2021",
        time: "04:00 PM",
        duration: "30 min",
    },
    {
        id: 9,
        title: "React Native Interview | GLA University",
        description: "React Native Interview | GLA University",
        status: "Past Interview",
        date: "01/12/2021",
        time: "01:00 PM",
        duration: "30 min",
    }
];

const Interviews = () => {

    const [activeTab, setActiveTab] = useState("Ongoing Interview")

    const renderContent = () => {
        switch (activeTab) {
            case 'Ongoing Interview':
                return <OngoingInerview />;
            case 'Upcoming Interview':
                return <UpcomingInterview />;
            case 'Past Interview':
                return <PastInterview />;
            default:
                return <OngoingInerview />;
        }
    }

    return (
        <div className="flex flex-col w-full p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">My Interviews</h1>

            <div className="flex border-b mb-6">
                <button
                    className={`py-2 px-4 ${activeTab === 'Ongoing Interview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('Ongoing Interview')}
                >
                    Ongoing Interviews
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'Upcoming Interview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('Upcoming Interview')}
                >
                    Upcoming Interview
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'Past Interview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('Past Interview')}
                >
                    Past Interviews
                </button>


            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};

const OngoingInerview = () => {
    return (

        <div className="flex mb-6 w-full flex-wrap">
            {interviews.filter(interview => interview.status === 'active now').map(interview => (
                <InterviewCard
                    key={interview.id}
                    props={interview}
                />
            ))}
        </div>

    );
}

const UpcomingInterview = () => {
    return (
        <div className="flex mb-6 w-full flex-wrap ">
            {interviews.filter(interview => interview.status === 'Upcoming Interview').map(interview => (
                <InterviewCard
                    key={interview.id}
                    props={interview}
                />
            ))}
        </div>
    );
}

const PastInterview = () => {
    return (
        <div className="flex flex-wrap">
            {interviews.filter(interview => interview.status === 'Past Interview').map(interview => (
                <InterviewCard
                    key={interview.id}
                    props={interview}
                />
            ))}
        </div>
    );
}

export default Interviews;



