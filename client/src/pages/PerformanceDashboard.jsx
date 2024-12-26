import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';
import Sidebar from '../components/global_components/Sidebar';

const PerformanceDashboard = () => {
  const infographicData = [
    { month: 'DSA', productivity: 180, efficiency: 150, quality: 200 },
    { month: 'OS', productivity: 160, efficiency: 170, quality: 180 },
    { month: 'CN', productivity: 140, efficiency: 160, quality: 170 },
    { month: 'DBMS', productivity: 130, efficiency: 140, quality: 150 },
    { month: 'ML', productivity: 120, efficiency: 130, quality: 140 },
    { month: 'Cloud', productivity: 150, efficiency: 160, quality: 170 },
    { month: 'Web', productivity: 140, efficiency: 150, quality: 160 },
    { month: 'Java', productivity: 130, efficiency: 140, quality: 150 },
    { month: 'Python', productivity: 150, efficiency: 160, quality: 170 },
  ];

  const performanceMetrics = [
    { name: 'DSA', score: 4.8 },
    { name: 'Operating System', score: 4.5 },
    { name: 'Computer Network', score: 4.3 },
    { name: 'DBMS', score: 4.6 },
    { name: 'Machine Learning', score: 4.7 },
    { name: 'Cyber Security', score: 4.4 },
  ];

  const skillsData = [
    { category: '1', Vocabulary: 25, Grammar: 45, 'Domain Knowledge': 90 },
    { category: '2', Vocabulary: 35, Grammar: 75, 'Domain Knowledge': 20 },
    { category: '3', Vocabulary: 45, Grammar: 65, 'Domain Knowledge': 85 },
    { category: '4', Vocabulary: 55, Grammar: 35, 'Domain Knowledge': 70 },
    { category: '5', Vocabulary: 20, Grammar: 85, 'Domain Knowledge': 95 }
  ];

  const performanceData = [
    { month: 1, coding: 80, technical: 35, scenario: 45 },
    { month: 2, coding: 65, technical: 75, scenario: 30 },
    { month: 3, coding: 70, technical: 68, scenario: 85 },
    { month: 4, coding: 45, technical: 80, scenario: 65 },
    { month: 5, coding: 85, technical: 85, scenario: 70 },
    { month: 6, coding: 90, technical: 82, scenario: 88 }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Section */}
      <div className="w-full md:w-1/4">
        <Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="w-full md:w-4/5 p-10">
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">
              Hello <span className="text-black">User</span>, welcome back!
            </h2>
            <div className="flex items-center">
              <i className="fas fa-bell text-gray-500 mr-5"></i>
              <div className="flex items-center">
                <img src="/api/placeholder/40/40" alt="User" className="rounded-full mr-2" />
                <span>User</span>
              </div>
            </div>
          </header>
        </div>

        <div className="bg-yellow-400 rounded-xl p-8 text-white">
          <div className="grid grid-cols-3 gap-8">
            {/* Monthly Performance Chart */}

            
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
              <div className="bg-white/60 rounded-lg p-4 h-64">
                <ResponsiveContainer>
                <BarChart data={infographicData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productivity" fill="#4299e1" stackId="stack" />
                  <Bar dataKey="efficiency" fill="#48bb78" stackId="stack" />
                  <Bar dataKey="quality" fill="#ed64a6" stackId="stack" />
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

            {/* Performance Trends */}
            {/* <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
              <div className="bg-white/60 rounded-lg p-4 h-64">
                <ResponsiveContainer>
                  <LineChart data={infographicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 238, 238, 0.1)" />
                    <XAxis dataKey="month" stroke="black" />
                    <YAxis stroke="black" />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="red" />
                    <Line type="monotone" dataKey="efficiency" stroke="blue" />
                    <Line type="monotone" dataKey="quality" stroke="aqua" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div> */}


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

            {/* Skills Assessment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
              <div className="bg-white rounded-lg p-4 space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
                      {metric.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-black">{metric.name}</p>
                      <p className="text-sm opacity-75 text-black">★ {metric.score.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="col-span-3">
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
                    </div> */}

            {/* Skills Analysis */}
            <div className="col-span-3 ">
              <h3 className="text-lg font-semibold mb-2">Skills Analysis</h3>
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
      </div>
    </div>
  );
};

export default PerformanceDashboard;