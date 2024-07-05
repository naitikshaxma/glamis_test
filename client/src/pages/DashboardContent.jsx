import React from 'react';
import Attendance from '../components/dashboard/Attendance';
import OverallPerformance from '../components/dashboard/OverallPerformance';
import Loader from '../components/Loader';
import { ResponsiveContainer } from 'recharts';
import { Button } from "@material-tailwind/react";
import TechnicalPerformance from '../components/dashboard/TechnicalPerformance';
import VerbalPerformance from '../components/dashboard/VerbalPerformance';
import { useNavigate } from 'react-router-dom';


const DashboardContent = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full p-6 bg-white rounded-lg">
      <div className="flex justify-between w-full">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <Button variant="gradient" color="#2b6030" className='mb-4' size="md"
      onClick={() =>{
        navigate('/interview/create')
      }
      }
      >  
        Start a Interview
      </Button>

      </div>

      <div className="flex justify-between flex-wrap">
        <div className="w-1/3">
          <ResponsiveContainer width="100%" height={270}>
            <Attendance />
          </ResponsiveContainer>
        </div>
        <div className="w-2/3">
          <ResponsiveContainer width="100%" height={270}>
            <OverallPerformance />
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 mt-20">
          <ResponsiveContainer width="100%" height={270}>
            <TechnicalPerformance />
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 mt-20">
          <ResponsiveContainer width="100%" height={270}>
            <VerbalPerformance />
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent;
