import React from 'react';
import Card from './Card';
import UpcomingItem from './UpcomingItem';
import StatisticCard from './StatisticCard';
import ActivityBar from './ActivityBar';

import Attendance from '../components/dashboard/Attendance';
import OverallPerformance from '../components/dashboard/OverallPerformance';
import Loader from '../components/Loader';
import { ResponsiveContainer } from 'recharts';
import { Button } from "@material-tailwind/react";
import TechnicalPerformance from '../components/dashboard/TechnicalPerformance';
import VerbalPerformance from '../components/dashboard/VerbalPerformance';
import { useNavigate } from 'react-router-dom';

import DetailedInterviewStats from './DetailedInterviewStats';

const DashboardContent = () => {
  const navigate = useNavigate();

  // Define navigation handler
  const handleNavigate = () => {
  
    navigate("/detailed-interview-stats"); // Navigate to the specified path
  };

  const handlebySubject = () => {
  
    navigate("/performance-dashboard"); // Navigate to the specified path
  };
  const Card = ({ title, lessons, progress, color, onClick }) => (
    <div
      className={`${color} rounded-xl p-6 text-white relative overflow-hidden cursor-pointer transition-transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm opacity-90">{lessons}</p>
          <div className="mt-4 relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-white"
              style={{
                clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
              {progress}%
            </div>
          </div>
        </div>
        <span className="text-4xl">👨‍💻</span>
      </div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
    </div>
  );

  return (

    <div className="w-4/5 p-10">
      <header className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold">
          Hello <span className="text-black">Krishankant</span>, welcome back!
        </h2>
        <div className="flex items-center">
          <i className="fas fa-bell text-gray-500 mr-5"></i>
          <div className="flex items-center">
            <img
              src="https://placehold.co/40x40"
              alt="User"
              className="rounded-full mr-2"
            />
            <span>Krishankant Saraswat</span>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <h3 className="text-xl font-bold mb-5">My Mock</h3>
        <div className="grid grid-cols-2 gap-5">
          <Card
            title="Interview by Company"
            lessons="20 lessons"
            progress="25%"
            color="bg-green-400"
            onClick={handleNavigate} // Pass click handler directly
          />
          

          <Card
            title="Interview by Subject"
            lessons="40 lessons"
            progress="75%"
            color="bg-yellow-400"
            onClick={handlebySubject}
          />
          <Card
            title="SVAR"
            lessons="35 lessons"
            progress="75%"
            color="bg-blue-400"
          />
          <Card
            title="Writing"
            lessons="30 lessons"
            progress="50%"
            color="bg-orange-400"
          />
          <Card
            title="Verbal/Reading"
            lessons="40 lessons"
            progress="75%"
            color="bg-pink-400"
          />
        </div>
      </section>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold">Upcoming</h3>
          <span className="text-blue-500 cursor-pointer">View All</span>
        </div>
        <div className="space-y-5">
          <UpcomingItem title="Reading - Beginner" time="8:00 AM - 10:00 AM" />
          <UpcomingItem
            title="Listening - Intermediate"
            time="03:00 PM - 04:00 PM"
          />
          <UpcomingItem
            title="Speaking - Beginner"
            time="8:00 AM - 12:00 PM"
          />
          <UpcomingItem
            title="Reading - Beginner"
            time="01:00 PM - 02:00 PM"
          />
          <UpcomingItem
            title="Speaking - Advanced"
            time="07:00 PM - 08:00 PM"
          />
          <UpcomingItem
            title="Listening - Beginner"
            time="08:00 AM - 12:00 PM"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-5">Statistics</h3>
        <div className="grid grid-cols-2 gap-5 mb-10">
          <StatisticCard title="Interview Completed" value="02" />
          <StatisticCard title="Interview In Progress" value="03" />
        </div>
        <div className="flex items-center mb-10">
          <img
            src="https://placehold.co/50x50"
            alt="User 1"
            className="rounded-full mr-2"
          />
          <img
            src="https://placehold.co/50x50"
            alt="User 2"
            className="rounded-full mr-2"
          />
          <img
            src="https://placehold.co/50x50"
            alt="User 3"
            className="rounded-full mr-2"
          />
          <img
            src="https://placehold.co/50x50"
            alt="User 4"
            className="rounded-full mr-2"
          />
          <div className="bg-yellow-400 py-2 px-4 rounded-full flex items-center">
            <span className="mr-2">#5829</span>
            <span>Krishankant Saraswat</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-5">Activity</h3>
        <div className="flex justify-between items-center mb-5">
          <span className="text-gray-500">Day</span>
          <span className="text-gray-500">Week</span>
          <span className="text-gray-500">Month</span>
        </div>
        <div className="flex justify-between items-center">
          <ActivityBar day="Mon" height="h-20" />
          <ActivityBar day="Tues" height="h-20" />
          <ActivityBar day="Wed" height="h-20" />
          <ActivityBar day="Thurs" height="h-40 bg-green-700" />
          <ActivityBar day="Fri" height="h-20" />
          <ActivityBar day="Sat" height="h-20" />
          <ActivityBar day="Sun" height="h-20" />
        </div>
      </section>
    </div>
  );
};

export default DashboardContent;
