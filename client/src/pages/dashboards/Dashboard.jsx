import React from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { bearerInstance as instance } from "../../helpers/instance.js";
import RecentlyScheduledInterview from "../../components/RecentlyScheduledInterview.jsx";
import AIAssignedWidget from "../../components/dashboard/AIAssignedWidget.jsx";

const mockMenuItems = [
  {
    title: "Company Interview",
    lessons: "20",
    progress: "Company",
    accentClass: "text-[#2b6030] hover:text-[#1f4723]",
    ringColor: "text-[#2b6030]",
    bgClass: "bg-green-50/50",
    borderHoverClass: "hover:border-green-300 hover:shadow-[0_15px_30px_rgba(43,96,48,0.06)]",
    path: "/dashboard/company",
    image: "Learning Foreign Languages 3D Illustration.png",
  },
  {
    title: "Subject Interview",
    lessons: "40",
    progress: "Subject",
    accentClass: "text-blue-700 hover:text-blue-800",
    ringColor: "text-blue-600",
    bgClass: "bg-blue-50/50",
    borderHoverClass: "hover:border-blue-300 hover:shadow-[0_15px_30px_rgba(33,150,243,0.06)]",
    path: "/dashboard/subject",
    image: "Businessman Work On Laptop.png",
  },
  {
    title: "SVAR Interview",
    lessons: "35",
    progress: "Svar",
    accentClass: "text-purple-700 hover:text-purple-800",
    ringColor: "text-purple-600",
    bgClass: "bg-purple-50/50",
    borderHoverClass: "hover:border-purple-300 hover:shadow-[0_15px_30px_rgba(156,39,176,0.06)]",
    path: "/dashboard/svar",
    image: "Group 48.png",
  },
  {
    title: "Written Interview",
    lessons: "30",
    progress: "Written",
    accentClass: "text-amber-700 hover:text-amber-800",
    ringColor: "text-amber-600",
    bgClass: "bg-amber-50/50",
    borderHoverClass: "hover:border-amber-300 hover:shadow-[0_15px_30px_rgba(255,193,7,0.06)]",
    path: "/dashboard/written",
    image: "Group 53.png",
  },
  {
    title: "Verbal Interview",
    lessons: "40",
    progress: "Verbal",
    accentClass: "text-red-700 hover:text-red-800",
    ringColor: "text-red-600",
    bgClass: "bg-red-50/50",
    borderHoverClass: "hover:border-red-300 hover:shadow-[0_15px_30px_rgba(244,67,54,0.06)]",
    path: "/dashboard/verbal",
    image: "Group 54.png",
  },
];

const ActivityBar = ({ day, height = "h-12", active = false }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-2.5 h-24 flex items-end">
      <div className="absolute inset-0 bg-slate-100 rounded-full border border-slate-200/50" />
      <div
        className={`w-full ${height} rounded-full transition-all duration-500 ${active
          ? 'bg-[#2b6030] shadow-[0_0_8px_rgba(43,96,48,0.3)]'
          : 'bg-slate-200'
          }`}
      />
    </div>
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{day}</span>
  </div>
);

const ProgressRing = ({ progress, color = "text-green-500", size = 64, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            filter: `drop-shadow(0 0 2px rgba(0,0,0,0.05))`,
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${color} font-bold text-xs`}>
        {progress}%
      </div>
    </div>
  );
};

const MockCard = ({ title, lessons, progress, accentClass, ringColor, bgClass, borderHoverClass, image, isFullWidth }) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] ${borderHoverClass} group flex flex-col justify-between`}
    >
      {/* Background tint overlay */}
      <div className={`absolute inset-0 ${bgClass} opacity-100 group-hover:scale-[1.03] transition-transform duration-500 -z-10`} />

      <div className="flex justify-between items-start w-full relative z-10">
        <div className="space-y-4 flex-1">
          <div>
            <h3 className={`text-slate-800 font-bold text-lg leading-tight tracking-wide group-hover:${accentClass.split(' ')[0]} transition-colors duration-300`}>{title}</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{lessons} lessons</p>
          </div>

          <div className="pt-2">
            <ProgressRing progress={parseFloat(progress).toFixed(0)} color={ringColor} />
          </div>
        </div>

        <div className={`${isFullWidth ? 'w-24 h-24' : 'w-20 h-20'} transition-transform duration-500 ease-out group-hover:scale-[1.08] flex-shrink-0 ml-4`}>
          <img src={image} alt={title} className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)]" />
        </div>
      </div>
    </div>
  );
};

// `scheduled` (the pending interview config) + `onStart` switch the dashboard
// into pre-interview lobby mode: the header and the My Interviews grid are
// replaced by the Recently Scheduled Interview card, while Statistics,
// Leaderboard and Activity stay. Absent these props, this is the normal dashboard.
const Dashboard = ({ scheduled = null, onStart, onExit } = {}) => {
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

  const maxActivity = Math.max(...stats.activity.map(a => a.count), 1);

  const getBarHeight = (count) => {
    if (count === 0) return 'h-4';
    const ratio = count / maxActivity;
    if (ratio > 0.8) return 'h-20';
    if (ratio > 0.6) return 'h-16';
    if (ratio > 0.4) return 'h-12';
    if (ratio > 0.2) return 'h-8';
    return 'h-6';
  };
  const formatCount = (n) => String(n).padStart(2, '0');

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50/70 min-h-screen">
      {/* Header — hidden in the pre-interview lobby */}
      {!scheduled && (
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/60">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-normal">
          Hello <span className="text-[#2b6030] font-black">{Cookies.get("fullName") || "Student"}</span>, welcome back!
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/create-interview">
            <button className="relative overflow-hidden bg-[#2b6030] hover:bg-[#1f4723] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-[0_4px_14px_rgba(43,96,48,0.25)] hover:shadow-[0_6px_20px_rgba(43,96,48,0.35)] flex items-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98] group">
              {/* Shimmer overlay */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
              Start Practice Interview
            </button>
          </Link>
        </div>
      </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Content */}
        <div className="flex-1">
          {scheduled ? (
            <RecentlyScheduledInterview pending={scheduled} onStart={onStart} onExit={onExit} />
          ) : (
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">My Interviews</h2>

            {/* Clean Light Panel Container for Cards */}
            <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl relative shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* Background abstract elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full filter blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full filter blur-[80px] pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {mockMenuItems.map((item, index) => (
                  <Link
                    to={item.path}
                    key={index}
                    className={index === 4 ? 'col-span-1 md:col-span-2' : 'col-span-1'}
                  >
                    <MockCard
                      title={item.title}
                      lessons={item.lessons}
                      progress={parseFloat(overallPercenatge[item.progress] || 0).toFixed(1)}
                      accentClass={item.accentClass}
                      ringColor={item.ringColor}
                      bgClass={item.bgClass}
                      borderHoverClass={item.borderHoverClass}
                      image={item.image}
                      isFullWidth={index === 4}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
          {/* AI Assigned Interviews */}
          <AIAssignedWidget />
          <div className="bg-white text-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full filter blur-[30px]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center hover:bg-slate-100/50 hover:border-slate-200 transition-all duration-300 group">
                <h3 className="text-slate-400 text-[9px] uppercase tracking-widest mb-2 font-bold group-hover:text-slate-500 transition-colors">Completed</h3>
                <p className="text-3xl font-extrabold text-[#2b6030] drop-shadow-[0_0_8px_rgba(43,96,48,0.15)] group-hover:scale-105 transition-transform duration-300">{formatCount(stats.completed)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center hover:bg-slate-100/50 hover:border-slate-200 transition-all duration-300 group">
                <h3 className="text-slate-400 text-[9px] uppercase tracking-widest mb-2 font-bold group-hover:text-slate-500 transition-colors">In Progress</h3>
                <p className="text-3xl font-extrabold text-blue-600 drop-shadow-[0_0_8px_rgba(33,150,243,0.05)] group-hover:scale-105 transition-transform duration-300">{formatCount(stats.inProgress)}</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white text-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full filter blur-[30px]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Leaderboard</h2>
            <div className="flex -space-x-2.5 mb-5 items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shadow-sm transition-transform hover:scale-105 hover:z-30 cursor-pointer">
                AB
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#2b6030] bg-green-50 flex items-center justify-center text-sm font-black text-[#2b6030] shadow-md z-20 scale-110 transition-transform hover:scale-115 cursor-pointer">
                DC
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shadow-sm transition-transform hover:scale-105 hover:z-30 cursor-pointer">
                KS
              </div>
            </div>
            <div className="bg-[#2b6030] text-white font-black py-2.5 px-5 rounded-full flex items-center justify-between shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <span className="text-sm font-black tracking-wide">#5829</span>
              <span className="text-[10px] uppercase tracking-widest font-black">{Cookies.get("fullName") || "User"}</span>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white text-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full filter blur-[30px]" />
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Activity</h2>
              <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/50 gap-1">
                <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#2b6030] text-white shadow-sm transition-all duration-300">Day</button>
                <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all duration-300">Week</button>
                <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all duration-300">Month</button>
              </div>
            </div>
            <div className="flex justify-between items-end bg-slate-50/50 border border-slate-100 p-5 rounded-xl">
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



