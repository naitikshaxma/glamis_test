import React, { useState } from 'react';
import InterviewCard from '../components/IntervierCard';
import { useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Interviews = () => {

    const [interviews, setInterviews] = useState([])

    const fetchInterviews = async () => {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/fetch`, {},
            {
                headers: {
                    "Authorization": `Bearer ${Cookies.get('accessToken')}`,
                    "Content-Type": "application/json"
                }
            }
        )

        if (response.data.statusCode === 200) {
            setInterviews(response.data.data)
        }
    }
    useEffect(() => {
        fetchInterviews();
    }, [])

    const [activeTab, setActiveTab] = useState("Ongoing Interview")

    const parseDate = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const renderContent = () => {
    const now = new Date();
    switch (activeTab) {
        case 'Ongoing Interview':
            const ongoingInterview = interviews.filter(interview => {
                const startDate = parseDate(interview.start_time);
                const endDate = parseDate(interview.end_time);
                if (!startDate) return false;
                if (endDate) {
                    return startDate < now && endDate > now;
                }
                return startDate <= now;
            });
            return <OngoingInterview ongoingInterview={ongoingInterview.reverse()} />;
        case 'Upcoming Interview':
            const upcomingInterview = interviews.filter(interview => {
                const startDate = parseDate(interview.start_time);
                return startDate ? startDate > now : false;
            });
            return <UpcomingInterview upcomingInterview={upcomingInterview.reverse()} />;
        case 'Past Interview':
            const pastInterview = interviews.filter(interview => {
                const endDate = parseDate(interview.end_time);
                return endDate ? endDate < now : false;
            });
            return <PastInterview pastInterview={pastInterview.reverse()} />;
        default:
            return <OngoingInterview />;
    }
}


    return (
        <div className="flex flex-col w-full p-6 bg-white h-screen rounded-lg">
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

const OngoingInterview = (props) => {
    return <>
        {props.ongoingInterview.length > 0 ?
          <div className="flex mb-6 w-[100vw] flex-wrap">
              {props.ongoingInterview.map(interview => (
                <InterviewCard
                  key={interview.id}
                  props={interview}
                  status={"active now"}
                />
              ))}
          </div>
          :
          <div className="flex items-center flex-col justify-center w-full h-96">
              <p className="text-xl text-gray-500 flex flex-wrap">It looks like you missed the sign-up deadline, so your interview hasn't been scheduled yet.</p>
          </div>}
    </>
}

const UpcomingInterview = (props) => {
    return (
        <div className="flex mb-6 w-[100vw] flex-wrap">
            {props.upcomingInterview.map(interview => (
                <InterviewCard
                    key={interview.id}
                    props={interview}
                    status={ "Upcoming Interview" }
                />
            ))}
        </div>
    );
}

const PastInterview = (props) => {
    return (
        <div className="flex mb-6 w-[100vw] flex-wrap">

            {props.pastInterview.map(interview => (
                <InterviewCard
                    key={interview.id}
                    props={interview}
                    status={ "Past Interview" }
                />
            ))}
        </div>
    );
}

export default Interviews;



