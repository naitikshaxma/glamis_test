import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';
import Sidebar from '../components/global_components/Sidebar';

const  WritingDashboard = () => {
  const infographicData = [
    { month: 'Cricket', interview1: 180, interview2: 150, interview3: 200 },
    { month: 'Politics', interview1: 160, interview2: 170, interview3: 180 },
    { month: 'Geo', interview1: 140, interview2: 160, interview3: 170 },
    { month: 'Science', interview1: 130, interview2: 140, interview3: 150 },
    { month: 'Tech', interview1: 120, interview2: 130, interview3: 140 },
    { month: 'History', interview1: 150, interview2: 160, interview3: 170 },
    { month: 'Eco', interview1: 140, interview2: 150, interview3: 160 },
    { month: 'Geo', interview1: 130, interview2: 140, interview3: 150 },
    { month: 'Current', interview1: 150, interview2: 160, interview3: 170 },
];
 
      const skillData = [
        { category: '1', Essay: 30, Jumbled: 45, Error: 65, Fillups: 25, thesaurus: 30 },
        { category: '2', Essay: 40, Jumbled: 55,  Error: 45,Fillups: 35, thesaurus: 30 },
        { category: '3', Essay: 35, Jumbled: 40,  Error: 60, Fillups: 45, thesaurus: 30 } ,
        { category: '4', Essay: 45, Jumbled: 50,  Error: 40, Fillups: 55, thesaurus: 30 },
        { category: '5', Essay: 50, Jumbled: 35, Error: 55, Fillups: 45, thesaurus: 30 },
        { category: '6', Essay: 50, Jumbled: 35,  Error: 55, Fillups: 45, thesaurus: 30 }
      ];
     
  

  const skillsData = [
    { category: '1', Vocabulary: 30, Grammar: 45, Knowledge: 65, },
    { category: '2', Vocabulary: 40, Grammar: 55, Knowledge: 45,  },
    { category: '3', Vocabulary: 35, Grammar: 40, Knowledge: 60,  } ,
    { category: '4', Vocabulary: 45, Grammar: 50, Knowledge: 40,  },
    { category: '5', Vocabulary: 50, Grammar: 35, Knowledge: 55,  }
  ];

  const leaderboardData = [
    { company: 'Google', score: '4,532,311', icon: 'G' },
    { company: 'Apple', score: '4,532,311', icon: 'A' },
    { company: 'Facebook', score: '4,532,311', icon: 'F' }
  ];

  const ExpandedView = () => (
    <div className="bg-orange-300 rounded-xl p-8">
      <div className="grid grid-cols-4 gap-6">
        {/* Main Charts Section */}
        <div className="col-span-3 space-y-6">
          {/* Top Bar Chart */}
         
          <div className="col-span-2">

          <h3 className="text-lg font-semibold mb-4">Word Count</h3>
                        <div className="bg-white/60 rounded-lg p-4 h-64">
                          <ResponsiveContainer>
                          <BarChart data={infographicData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="interview1" fill="#4299e1" stackId="stack" />
                            <Bar dataKey="interview2" fill="#48bb78" stackId="stack" />
                            <Bar dataKey="interview3" fill="#ed64a6" stackId="stack" />
                          </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

          {/* Middle Bar Chart */}
          <h3 className="text-lg font-semibold mb-4">Skills Analysis</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
                     <ResponsiveContainer>
                       <BarChart data={skillData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="category" />
                         <YAxis />
                         <Tooltip />
                         <Bar dataKey="Essay" fill="#FF6B6B" />
                         <Bar dataKey="Jumbled" fill="#4ECDC4" />
                         <Bar dataKey="Error" fill="#45B7D1" />
                         <Bar dataKey="Fillups" fill="yellow" />
                         <Bar dataKey="thesaurus" fill="lightblue" />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
          {/* Bottom Bar Chart */}
          <h3 className="text-lg font-semibold mb-4">Communication Skills</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Vocabulary" fill="#FF6B6B" />
                <Bar dataKey="Grammar" fill="#4ECDC4" />
                <Bar dataKey="Knowledge" fill="#45B7D1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="space-y-6">
          {/* Performance Gauge */}
          <div className="bg-white/60 rounded-lg p-4">
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
              Hello <span className="text-black">Krishankant</span>, welcome back!
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

export default WritingDashboard;