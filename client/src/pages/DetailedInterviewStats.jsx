import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';
import Sidebar from '../components/global_components/Sidebar';

const DetailedInterviewStats = () => {
  const companyData = [
    { name: 'Google', marks: 85 },
    { name: 'Apple', marks: 65 },
    { name: 'Airbnb', marks: 45 },
    { name: 'Microsoft', marks: 42 },
    { name: 'Tesla', marks: 60 },
    { name: 'BlackRock', marks: 30 }
  ];

  const performanceData = [
    { month: 1, coding: 80, technical: 35, scenario: 45 },
    { month: 2, coding: 65, technical: 75, scenario: 30 },
    { month: 3, coding: 70, technical: 68, scenario: 85 },
    { month: 4, coding: 45, technical: 80, scenario: 65 },
    { month: 5, coding: 85, technical: 85, scenario: 70 },
    { month: 6, coding: 90, technical: 82, scenario: 88 }
  ];

  const skillsData = [
    { category: '1', Vocabulary: 25, Grammar: 45, 'Domain Knowledge': 90 },
    { category: '2', Vocabulary: 35, Grammar: 75, 'Domain Knowledge': 20 },
    { category: '3', Vocabulary: 45, Grammar: 65, 'Domain Knowledge': 85 },
    { category: '4', Vocabulary: 55, Grammar: 35, 'Domain Knowledge': 70 },
    { category: '5', Vocabulary: 20, Grammar: 85, 'Domain Knowledge': 95 }
  ];

  const leaderboardData = [
    { company: 'Google', score: '4,532,311', icon: 'G' },
    { company: 'Apple', score: '4,532,311', icon: '' },
    { company: 'Facebook', score: '4,532,311', icon: 'f' }
  ];

  const ExpandedView = () => (
    <div className="bg-green-400 rounded-xl p-8 text-white">
      <div className="grid grid-cols-3 gap-8">
        {/* Company Performance Chart */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-4">Company Performance</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip />
                <Bar dataKey="marks" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Gauge */}
        <div>
          <div className="bg-white/30 rounded-lg p-4 h-64">
            <h3 className="text-lg font-semibold mb-2">Performance</h3>
            <p className="text-sm mb-4">Average score last of 5 interviews</p>
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 rounded-full border-8 border-white/30"></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-white"
                style={{
                  clipPath: 'polygon(0 0, 95% 0, 95% 100%, 0 100%)'
                }}
              ></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Smile className="w-8 h-8 mb-2" />
                <span className="text-2xl font-bold">95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 238, 238, 0.1)" />
                <XAxis dataKey="month" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip />
                <Line type="monotone" dataKey="coding" stroke="red" />
                <Line type="monotone" dataKey="technical" stroke="blue" />
                <Line type="monotone" dataKey="scenario" stroke="aqua" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
          <div className="bg-white rounded-lg p-4 space-y-4">
            {leaderboardData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-black">{item.company}</p>
                  <p className="text-sm opacity-75 text-black">#{item.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="col-span-3">
          <h3 className="text-lg font-semibold mb-4">Skills Analysis</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="category" stroke="black" />
                <YAxis stroke="black" />
                <Tooltip />
                <Bar dataKey="Vocabulary" fill="#69247C" />
                <Bar dataKey="Grammar" fill="#DA498D" />
                <Bar dataKey="Domain Knowledge" fill="#4DA1A9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <ExpandedView />
      </div>
    </div>
  );
};

export default DetailedInterviewStats;
