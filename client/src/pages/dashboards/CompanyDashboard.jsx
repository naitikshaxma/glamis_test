import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import {Smile} from 'lucide-react';
import Sidebar from '../../components/global_components/Sidebar.jsx';
import {bearerInstance as instance} from "../../helpers/instance.js";
import Cookies from "js-cookie";


const leaderboardData = [
  {company: 'Google', score: '4,532,311', icon: 'G'},
  {company: 'Apple', score: '4,532,311', icon: 'A'},
  {company: 'Facebook', score: '4,532,311', icon: 'F'}
];


const CompanyDashboard = () => {
  const [chartsData, setChartsData] = React.useState({});
  const [overallPercenatge, setOverallPercenatge] = React.useState(0);

    const fetchData = async () => {
    const res = await instance.get('/api/v1/dashboard/company');
    setChartsData(res.data);
    let overall = res.data.reduce((acc, item) => acc + item.OverallPerformance, 0) / res.data.length;
    overall = parseFloat(overall).toFixed(2);
    setOverallPercenatge(overall);
  }

  React.useEffect(() => {
    fetchData();
  }, []);



  const ExpandedView = () => (
    <div className="bg-green-400 rounded-xl p-8 text-white">
      <div className="grid grid-cols-3 gap-8">
        {/* Company Performance Chart */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-4">Company Performance</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <BarChart data={chartsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="Title" stroke="black" />
                <YAxis stroke="black" domain={[0,100]}/>
                <Tooltip />
                <Bar dataKey="OverallPerformance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Gauge */}
        <div>
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
                <span className="text-2xl text-black font-bold">{overallPercenatge}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Performance Trend */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <div className="bg-white/60 rounded-lg p-4 h-64">
            <ResponsiveContainer>
              <LineChart data={chartsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 238, 238, 0.1)" />
                <XAxis dataKey="Title" stroke="black" />
                <YAxis stroke="black" domain={[0,100]}/>
                <Tooltip />
                <Line type="monotone" dataKey="Easy" stroke="red" />
                <Line type="monotone" dataKey="Medium" stroke="blue" />
                <Line type="monotone" dataKey="Hard" stroke="aqua" />
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
              <BarChart data={chartsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="Title" stroke="black" />
                <YAxis stroke="black" domain={[0,100]}/>
                <Tooltip />
                <Bar dataKey="Vocabulary" fill="#69247C" />
                <Bar dataKey="Grammar" fill="#DA498D" />
                <Bar dataKey="OverallPerformance" fill="#4DA1A9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <Sidebar/>
      </div>

      {/* Main Content */}
      <div className="flex-1  overflow-auto">
        <div className="w-full md:w-4/5 p-7">
          <header className="flex justify-between items-center ">
            <h2 className="text-2xl font-bold">
              Hello <span className="text-black">{Cookies.get("fullName")}</span>, welcome back!
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
                <span>{Cookies.get("fullName")}</span>
              </div>
            </div>
          </header>


        </div>
        <h3 className="text-xl font-bold mb-5 ml-7">My Interviews</h3>
        <ExpandedView/>
      </div>
    </div>
  );
};


export default CompanyDashboard;
