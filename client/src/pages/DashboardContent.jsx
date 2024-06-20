import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const attendenceData = [
  { name: 'Present', value: 400, },
  { name: 'Absent', value: 300 },
  { name: 'Late', value: 300 },
  { name: 'Leave', value: 200 },
];

const performanceData = [
  { name: '12/12/2024', Average: 60, Current: 74, },
  { name: '12/12/2025', Average: 50, Current: 20, },
  { name: '12/12/2026', Average: 55, Current: 90, },
  { name: '12/12/2027', Average: 83, Current: 100, }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardContent = () => {
  return (
    <div className="flex flex-col w-full p-6 bg-white rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="flex justify-between">
        <div className="w-1/3 mr-1">
          <Attendance />
        </div>
        <div className="w-2/3 ml-1">
          <OverallPerformance />
        </div>
      </div>
    </div>
  )
}

const Attendance = () => {
  return (
    <div className="shadow-md rounded-lg p-4">
      <h1 className="text-xl font-semibold">Attendance</h1>
      <div className="flex justify-between pt-6">
        <PieChart width={300} height={300}>
          <Pie dataKey="value" data={attendenceData} cx={170} outerRadius={100} fill="#8884d8" label>
            {
              attendenceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
            }
          </Pie>
        </PieChart>
      </div>
    </div>
  )
}

const OverallPerformance = () => {
  return (
    <div className="shadow-md rounded-lg p-4">
      <h1 className="text-xl font-semibold">Overall Performance</h1>
      <div className="flex justify-between pt-6">
        <LineChart
          width={700}
          height={300}
          data={performanceData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Average" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Current" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  )
}
export default DashboardContent;
