import React from 'react';
import Attendance from '../components/dashboard/Attendance';
import OverallPerformance from '../components/dashboard/OverallPerformance';
import Loader from '../components/Loader';
import { ResponsiveContainer } from 'recharts';

const DashboardContent = () => {
  return (
    <div className="flex flex-col w-full p-6 bg-white rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="flex justify-between">
        <div className="w-1/3 mr-1">
          <ResponsiveContainer width="100%" height={300}>
            <Attendance />
          </ResponsiveContainer>
        </div>
        <div className="w-2/3 ml-1">
          <ResponsiveContainer width="100%" height={300}>
            <OverallPerformance />
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    // <Loader />
  )
}

export default DashboardContent;
