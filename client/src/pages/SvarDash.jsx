import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';
import Sidebar from '../components/global_components/Sidebar';

const SvarDash = () => {
  const companyData = [
    { name: '1', value: 25 },
    { name: '2', value: 45 },
    { name: '3', value: 35 },
    { name: '4', value: 55 },
    { name: '5', value: 20 }
  ];

  const skillsData = [
    { category: '1', skill1: 30, skill2: 45, skill3: 65, skill4: 25 },
    { category: '2', skill1: 40, skill2: 55, skill3: 45, skill4: 35 },
    { category: '3', skill1: 35, skill2: 40, skill3: 60, skill4: 45 } ,
    { category: '4', skill1: 45, skill2: 50, skill3: 40, skill4: 55 },
    { category: '5', skill1: 50, skill2: 35, skill3: 55, skill4: 45 }
  ];

  const leaderboardData = [
    { company: 'Google', score: '4,532,311', icon: 'G' },
    { company: 'Apple', score: '4,532,311', icon: 'A' },
    { company: 'Facebook', score: '4,532,311', icon: 'F' }
  ];

  const ExpandedView = () => (
    <div className="bg-blue-100 rounded-xl p-8">
      <div className="grid grid-cols-4 gap-6">
        {/* Main Charts Section */}
        <div className="col-span-3 space-y-6">
          {/* Top Bar Chart */}
          <div className="bg-white rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="skill1" fill="#FF6B6B" />
                <Bar dataKey="skill2" fill="#4ECDC4" />
                <Bar dataKey="skill3" fill="#45B7D1" />
                <Bar dataKey="skill4" fill="yellow" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Middle Bar Chart */}
          <div className="bg-white rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#9B5DE5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Bar Chart */}
          <div className="bg-white rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="skill1" fill="#FF6B6B" />
                <Bar dataKey="skill2" fill="#4ECDC4" />
                <Bar dataKey="skill3" fill="#45B7D1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="space-y-6">
          {/* Performance Gauge */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Performance</h3>
            <p className="text-sm text-gray-500 mb-4">Average score last of 5 interviews</p>
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 rounded-full border-8 border-gray-100"></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-green-400"
                style={{
                  clipPath: 'polygon(0 0, 95% 0, 95% 100%, 0 100%)'
                }}
              ></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Smile className="w-8 h-8 mb-2 text-green-400" />
                <span className="text-2xl font-bold">95%</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
            <div className="space-y-4">
              {leaderboardData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{item.company}</p>
                    <p className="text-sm text-gray-500">#{item.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Sidebar />
          </div>
    
          {/* Main Content */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="w-full md:w-4/5 p-10">
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
                    <span>Krishankant </span>
                  </div>
                </div>
              </header>
    
             
            </div>
            <ExpandedView />
          </div>
        </div>
  );
};

export default SvarDash;