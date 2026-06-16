import React from 'react';
import Cookies from 'js-cookie';
import {Link} from 'react-router-dom';
import {bearerInstance as instance} from "../../helpers/instance.js";

const mockMenuItems = [
  {
    title: "Company Interview",
    lessons: "20",
    progress: "Company",
    color: "bg-green-400",
    path: "/dashboard/company",
    image: "Learning Foreign Languages 3D Illustration.png",
  },
  {
    title: "Subject Interview",
    lessons: "40",
    progress: "Subject",
    color: "bg-yellow-400",
    path: "/dashboard/subject",
    image: "Businessman Work On Laptop.png",
  },
  {
    title: "SVAR Interview",
    lessons: "35",
    progress: "Svar",
    color: "bg-blue-400",
    path: "/dashboard/svar",
    image: "Group 48.png",
  },
  {
    title: "Written Interview",
    lessons: "30",
    progress: "Written",
    color: "bg-orange-400",
    path: "/dashboard/written",
    image: "Group 53.png",
  },
  {
    title: "Verbal Interview",
    lessons: "40",
    progress: "Verbal",
    color: "bg-pink-400",
    path: "/dashboard/verbal",
    image: "Group 54.png",
  },
];

const ActivityBar = ({day, height = "h-20", active = false}) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-8 ${height} ${active ? 'bg-green-700' : 'bg-gray-200'} rounded-full`}></div>
    <span className="text-sm text-gray-500">{day}</span>
  </div>
);

const MockCard = ({title, lessons, progress, color, image, onClick}) => (
  <div
    onClick={onClick}
    className={`${color} rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-transform hover:scale-105`}
  >
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-white/90 text-sm">{lessons} lessons</p>
        <div className="mt-4 relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
          <div
            className="relative w-16 h-16 rounded-full"
            style={{
              maskImage: `conic-gradient(white ${progress}%, transparent 0)`
            }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-white"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
            {progress}%
          </div>
        </div>
      </div>
      <div className="w-24 h-45"> {/* Increased from w-16 h-16 to w-24 h-24 */}
        <img src={image} alt={title} className="w-full h-full object-contain"/>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [overallPercenatge, setOverallPercenatge] = React.useState(0);
  const [stats, setStats] = React.useState({
    completed: 0,
    inProgress: 0,
    activity: [
      { day: 'Mon', count: 0 },
      { day: 'Tues', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thurs', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ]
  });

  const fetchData = async () => {
    try {
      const res = await instance.get('/api/v1/dashboard/');
      setOverallPercenatge(res.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  }

  const fetchStats = async () => {
    try {
      const res = await instance.get('/api/v1/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }

  React.useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  // Calculate max activity count for scaling bar heights
  const maxActivity = Math.max(...stats.activity.map(a => a.count), 1);

  // Get height class based on count relative to max
  const getBarHeight = (count) => {
    if (count === 0) return 'h-8';
    const ratio = count / maxActivity;
    if (ratio > 0.8) return 'h-40';
    if (ratio > 0.6) return 'h-32';
    if (ratio > 0.4) return 'h-24';
    if (ratio > 0.2) return 'h-16';
    return 'h-12';
  };

  // Format number with leading zero
  const formatCount = (n) => String(n).padStart(2, '0');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Hello <span>{Cookies.get("fullName")}</span>, welcome back!
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/create-interview">
            <button className="bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl hover:bg-green-800 transition-all transform hover:scale-[1.02] shadow-md text-sm">
              Start Practice Interview
            </button>
          </Link>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Content */}
        <div className="flex-1">
          {/* Mock Cards Grid */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">My Interviews</h2>
            <div className="grid grid-cols-2 gap-4">
              {mockMenuItems.map((item, index) => (
                <Link to={item.path} key={index}>
                  <MockCard
                    title={item.title}
                    lessons={item.lessons}
                    progress={parseFloat(overallPercenatge[item.progress] || 0).toFixed(1)}
                    color={item.color}
                    image={item.image}
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {/* Statistics Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-500 text-sm mb-2">Interview Completed</h3>
                <p className="text-3xl font-bold">{formatCount(stats.completed)}</p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-2">Interview In Progress</h3>
                <p className="text-3xl font-bold">{formatCount(stats.inProgress)}</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
            <div className="flex -space-x-2 mb-4 items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                   alt="User" className="w-12 h-12 rounded-full border-2 border-white z-10"/>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                   alt="User" className="w-17 h-16 rounded-full border-2 border-white z-20"/>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                   alt="User" className="w-12 h-12 rounded-full border-2 border-white z-10"/>
            </div>
            <div className="bg-yellow-400 py-2 px-4 rounded-full flex items-center">
              <span className="mr-2">#5829</span>
              <span>User</span>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Activity</h2>
              <div className="flex gap-4">
                <button className="text-gray-500">Day</button>
                <button className="text-gray-500">Week</button>
                <button className="text-gray-500">Month</button>
              </div>
            </div>
            <div className="flex justify-between items-end">
              {stats.activity.map((item, index) => (
                <ActivityBar
                  key={index}
                  day={item.day}
                  height={getBarHeight(item.count)}
                  active={item.count > 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
