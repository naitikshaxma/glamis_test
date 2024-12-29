import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';
import Sidebar from '../components/global_components/Sidebar';

const SvarDash = () => {
  const companyData = [
    { name: 'Interview 1', Score: 25 },
    { name: 'Interview 2', Score: 45 },
    { name: 'Interview 3', Score: 35 },
    { name: 'Interview 4', Score: 55 },
    { name: 'Interview 5', Score: 20 }
  ];

  const skillsData = [
    { category: 'Interview 1', Reading: 30, Writing: 45, Speaking: 65, Jumble: 25, Comprehensive: 40 },
    { category: 'Interview 2', Reading: 40, Writing: 55, Speaking: 45, Jumble: 35, Comprehensive: 50 },
    { category: 'Interview 3', Reading: 35, Writing: 40, Speaking: 60, Jumble: 45, Comprehensive: 55 },
    { category: 'Interview 4', Reading: 45, Writing: 50, Speaking: 40, Jumble: 55, Comprehensive: 60 },
    { category: 'Interview 5', Reading: 50, Writing: 35, Speaking: 55, Jumble: 45, Comprehensive: 65 }
];

  const skillData = [
    { category: 'Interview 1', Correctness: 30, Grammar: 45, Punctuation: 65, },
    { category: 'Interview 2', Correctness: 40,  Grammar: 55, Punctuation: 45, },
    { category: 'Interview 3', Correctness: 35,  Grammar: 40, Punctuation: 60, },
    { category: 'Interview 4', Correctness: 45,  Grammar: 50, Punctuation: 40, },
    { category: 'Interview 5', Correctness: 50,  Grammar: 35, Punctuation: 55, }
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
                <Bar dataKey="Reading" fill="#FF6B6B" />
  <Bar dataKey="Writing" fill="#4ECDC4" />
  <Bar dataKey="Speaking" fill="#45B7D1" />
  <Bar dataKey="Jumble" fill="yellow" />
  <Bar dataKey="Comprehensive" fill="lightblue" />
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
                <Bar dataKey="Score" fill="#9B5DE5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Bar Chart */}
          <div className="bg-white rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Correctness" fill="#FF6B6B" />
                <Bar dataKey="Grammar" fill="#4ECDC4" />
                <Bar dataKey="Punctuation" fill="#45B7D1" />
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
      <div className="flex-1  overflow-auto">
        <div className="w-full md:w-4/5 p-7">
          <header className="flex justify-between items-center ">
            <h2 className="text-2xl font-bold">
              Hello <span className="text-black">Krishankant Saraswat</span>, welcome back!
            </h2>

            <div className="flex items-center">
              <i className="fas fa-bell text-gray-500 mr-5"></i>
              <div className="flex items-center ">
                <img
                  src="https://placehold.co/40x40"
                  alt="User"
                  className="rounded-full mr-2"
                />
                <span>Krishankant Saraswat </span>
              </div>
            </div>
          </header>


        </div>
        <h3 className="text-xl font-bold mb-5 ml-7">My Mock</h3>


        <ExpandedView />
      </div>
    </div>
  );
};

export default SvarDash;