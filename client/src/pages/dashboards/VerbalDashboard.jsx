import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import {Smile} from 'lucide-react';

import {bearerInstance as instance} from "../../helpers/instance.js";
import Cookies from "js-cookie";


const leaderboardData = [
  {company: 'Google', score: '4,532,311', icon: 'G'},
  {company: 'Apple', score: '4,532,311', icon: 'A'},
  {company: 'Facebook', score: '4,532,311', icon: 'F'}
];


const  VerbalDashboard = () => {
  const [chartsData, setChartsData] = React.useState({});
  const [overallPercenatge, setOverallPercenatge] = React.useState(0);

    const fetchData = async () => {
    const res = await instance.get('/api/v1/dashboard/verbal');
    setChartsData(res.data);
    const overall = res.data.reduce((acc, item) => acc + item.OverallPerformance, 0) / res.data.length;
    setOverallPercenatge(overall);
  }

  React.useEffect(() => {
    fetchData();
  }, []);



  const ExpandedView = () => (
    <div className="bg-pink-300 rounded-xl p-8">
      <div className="grid grid-cols-4 gap-6">
        {/* Main Charts Section */}
        <div className="col-span-3 space-y-6">
          {/* Middle Bar Chart */}
           <div className="col-span-2">
           <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
                    <div className="bg-white/60 rounded-lg p-4 h-64">
                      <ResponsiveContainer>
                        <LineChart data={chartsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 238, 238, 0.1)" />
                          <XAxis dataKey="Title" stroke="black" />
                          <YAxis stroke="black" />
                          <Tooltip />
                          <Line type="monotone" dataKey="Easy" stroke="red"/>
                          <Line type="monotone" dataKey="Medium" stroke="blue"/>
                          <Line type="monotone" dataKey="Hard" stroke="aqua"/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
          {/* Bottom Bar Chart */}
          <h3 className="text-lg font-semibold mb-4">Communication Skills</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={chartsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="Title"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="Vocabulary" fill="#FF6B6B"/>
                <Bar dataKey="Grammar" fill="#4ECDC4"/>
                <Bar dataKey="OverallPerformance" fill="#45B7D1"/>
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
                className="relative w-40 h-40 rounded-full bg-gray-200"
                style={{
                  maskImage: `conic-gradient(green ${overallPercenatge}%, transparent 0)`
                }}
              >
                <div className="absolute inset-0 rounded-full border-8 border-green-400"></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/*<Smile className="w-8 h-8 mb-2 text-green-400" />*/}
                <span className="text-2xl font-bold">{overallPercenatge}%</span>
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
    <div className="w-full overflow-auto">
      <div className="w-full p-7">
        <header className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Hello <span className="text-black">{Cookies.get("fullName")}</span>, welcome back!
          </h2>
          <div className="flex items-center">
            <i className="fas fa-bell text-gray-500 mr-5"></i>
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                alt="User"
                height="40"
                width="40"
                className="h-8 w-8 rounded-full border-green-600 border-2 mr-2"
              />
              <span>{Cookies.get("fullName")}</span>
            </div>
          </div>
        </header>
      </div>
      <h3 className="text-xl font-bold mb-5 ml-7">My Interviews</h3>
      <ExpandedView/>
    </div>
  );
};

export default VerbalDashboard;
