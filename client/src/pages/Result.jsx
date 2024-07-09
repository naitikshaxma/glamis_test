import React from 'react';
import { Dialog, Typography, Button, IconButton } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { resultPopupState } from '../store/atoms/resultPopup';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import avatar from '../assets/avatar.jpeg';

const pieData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const barData = [
  { name: 'Vocabulary', score: 85 },
  { name: 'Pronunciation', score: 78 },
  { name: 'Grammar', score: 90 },
  { name: 'Fluency', score: 80 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const technicalExpertiseScore = 75; // Example score

export default function Result() {
  const setResultPopup = useSetRecoilState(resultPopupState);
  const isOpen = useRecoilValue(resultPopupState);
  const onClose = () => {
    setResultPopup(false);
  };

  return (
    <Dialog open={isOpen} handler={onClose}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 rounded-t">
        <Typography variant="h5" color="blue-gray">
          Result Details
        </Typography>
        <IconButton color="blue-gray" size="sm" variant="text" onClick={onClose}>
          <XMarkIcon className="w-5 h-5" />
        </IconButton>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="mr-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full">
              <img src={avatar} alt="profile" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
          <div>
            <Typography>Name - Shubh Chaturvedi</Typography>
            <Typography>Uni Roll - 2115000976</Typography>
            <Typography>Subject - DBMS</Typography>
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <div className="w-1/4 flex justify-center items-center">
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                cx={100}
                cy={100}
                innerRadius={50}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="w-3/4">
            <div className="mb-4">
              <BarChart width={420} height={150} data={barData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </div>
            <div className="w-98">
              <div className="mb-2">
                <Typography>Technical Expertise</Typography>
              </div>
              <div className="relative h-6 bg-gray-300 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                  style={{ width: `${technicalExpertiseScore}%` }}
                ></div>
                <div className="absolute top-0 left-0 h-full flex items-center justify-center w-full text-white">
                  <Typography>{`${technicalExpertiseScore}%`}</Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button color="blue" fullWidth onClick={onClose}>
          Detailed report
        </Button>
      </div>
    </Dialog>
  );
}
