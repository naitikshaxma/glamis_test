import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';
import Sidebar from '../../components/global_components/Sidebar.jsx';
import { bearerInstance } from '../../helpers/instance.js';
import Cookies from 'js-cookie'

const SubjectDashboard = () => {
  const [subjectPerformance,setSubjectPerformance] = useState({});
  const [overallPercenatge, setOverallPercenatge] = useState(0);

    const getData = async()=>{
      const response = await bearerInstance.get("/api/v1/dashboard/subject");
      console.log(response);
      setSubjectPerformance(response.data.data);
      const overall = response.data.data.reduce((acc, item) => acc + item.performance, 0) / response.data.data.length;
      setOverallPercenatge(overall);
    }
    useEffect(()=>{
      getData();
    },[]);

  const infographicData = [
    { month: 'DSA', interview1: 180, interview2: 150, interview3: 200 },
    { month: 'OS', interview1: 160, interview2: 170, interview3: 180 },
    { month: 'CN', interview1: 140, interview2: 160, interview3: 170 },
    { month: 'DBMS', interview1: 130, interview2: 140, interview3: 150 },
    { month: 'ML', interview1: 120, interview2: 130, interview3: 140 },
    { month: 'Cloud', interview1: 150, interview2: 160, interview3: 170 },
    { month: 'Web', interview1: 140, interview2: 150, interview3: 160 },
    { month: 'Java', interview1: 130, interview2: 140, interview3: 150 },
    { month: 'Python', interview1: 150, interview2: 160, interview3: 170 },
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
    { month: 1, Easy: 80, Medium: 35, Hard: 45 },
    { month: 2, Easy: 65, Medium: 75, Hard: 30 },
    { month: 3, Easy: 70, Medium: 68, Hard: 85 },
    { month: 4, Easy: 45, Medium: 80, Hard: 65 },
    { month: 5, Easy: 85, Medium: 85, Hard: 70 },
    { month: 6, Easy: 90, Medium: 82, Hard: 88 }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Section */}
      <div className="w-full md:w-1/4">
        <Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1  overflow-auto">
        <div className="w-full md:w-4/5 p-7">
          <header className="flex justify-between items-center ">
            <h2 className="text-2xl font-bold">
              Hello <span className="text-black">{Cookies.get('fullName')}</span>, welcome back!
            </h2>

            <div className="flex items-center">
              <i className="fas fa-bell text-gray-500 mr-5"></i>
              <div className="flex items-center ">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                  alt="User"
                  height="40"
                  width="40"
                  className="h-8 w-8 rounded-full border-green-600 border-2 mr-2"
                />
                <span>{Cookies.get('fullName')}</span>
              </div>
            </div>
          </header>


        </div>
        <h3 className="text-xl font-bold mb-5 ml-7">My Mock</h3>

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
                  <Bar dataKey="interview1" fill="#4299e1" stackId="stack" />
                  <Bar dataKey="interview2" fill="#48bb78" stackId="stack" />
                  <Bar dataKey="interview3" fill="#ed64a6" stackId="stack" />
                </BarChart>
                </ResponsiveContainer>
              </div>
            </div>




            {/* Performance Gauge */}
            <div className="bg-white rounded-lg p-4">
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
                {/*<Smile className="w-8 h-8 mb-2 text-green-400"/>*/}
                <span className="text-2xl text-black font-bold">{overallPercenatge.toFixed(2)}%</span>
              </div>
            </div>
          </div>



            <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <LineChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 238, 238, 0.1)" />
                <XAxis dataKey="month" stroke="black" />
                <YAxis stroke="black" domain={[0,100]}/>
                <Tooltip />
                <Line type="monotone" dataKey="easyAvgPerformance" stroke="red" />
                <Line type="monotone" dataKey="mediumAvgPerformance" stroke="blue" />
                <Line type="monotone" dataKey="hardAvgPerformance" stroke="aqua" />
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
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="company" stroke="black" />
                    <YAxis stroke="black" domain={[0,100]}/>
                    <Tooltip />
                    <Bar dataKey="vocabulary" fill="#69247C" />
                    <Bar dataKey="grammar" fill="#DA498D" />
                    <Bar dataKey="performance" fill="#4DA1A9" />
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

export default SubjectDashboard;
