import React from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { bearerInstance as instance } from "../../helpers/instance.js";

const mockMenuItems = [
  {
    title: "Company Interview",
    lessons: "20",
    progress: "Company",
    gradient: "from-[#0c2e28] to-[#121c1a]/90 hover:shadow-[0_0_20px_rgba(12,46,40,0.4)]",
    path: "/dashboard/company",
    image: "Learning Foreign Languages 3D Illustration.png",
  },
  {
    title: "Subject Interview",
    lessons: "40",
    progress: "Subject",
    gradient: "from-[#0e2133] to-[#0d1621]/90 hover:shadow-[0_0_20px_rgba(14,33,51,0.4)]",
    path: "/dashboard/subject",
    image: "Businessman Work On Laptop.png",
  },
  {
    title: "SVAR Interview",
    lessons: "35",
    progress: "Svar",
    gradient: "from-[#271033] to-[#150a1a]/90 hover:shadow-[0_0_20px_rgba(39,16,51,0.4)]",
    path: "/dashboard/svar",
    image: "Group 48.png",
  },
  {
    title: "Written Interview",
    lessons: "30",
    progress: "Written",
    gradient: "from-[#1d2d38] to-[#111920]/90 hover:shadow-[0_0_20px_rgba(29,45,56,0.4)]",
    path: "/dashboard/written",
    image: "Group 53.png",
  },
  {
    title: "Verbal Interview",
    lessons: "40",
    progress: "Verbal",
    gradient: "from-[#282828] to-[#121212]/90 hover:shadow-[0_0_20px_rgba(40,40,40,0.4)]",
    path: "/dashboard/verbal",
    image: "Group 54.png",
  },
];

const ActivityBar = ({ day, height = "h-12", active = false }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-2 h-24 flex items-end">
      <div className="absolute inset-0 bg-white/[0.04] rounded-full border border-white/[0.05]" />
      <div
        className={`w-full ${height} rounded-full transition-all duration-500 ${active
          ? 'bg-gradient-to-t from-[#1B4332] to-[#C9A52C] shadow-[0_0_8px_rgba(201,165,44,0.4)]'
          : 'bg-white/10'
          }`}
      />
    </div>
    <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">{day}</span>
  </div>
);

const ProgressRing = ({ progress, size = 64, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-[#C9A52C]"
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
            filter: 'drop-shadow(0 0 3px rgba(201, 165, 44, 0.5))',
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[#C9A52C] font-black text-[10px] drop-shadow-[0_0_3px_rgba(201,165,44,0.5)]">
        {progress}%
      </div>
    </div>
  );
};

const MockCard = ({ title, lessons, progress, gradient, image, isFullWidth }) => {
  // Safe extraction of gradient class part without hover
  const gradientClass = gradient.split(' hover:')[0];

  return (
    <div
      className="bg-white/[0.05] backdrop-blur-[16px] border border-white/[0.12] rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-[#C9A52C]/40 hover:shadow-[0_10px_30px_rgba(201,165,44,0.1)] group flex flex-col justify-between"
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-300 -z-10`} />

      <div className="flex justify-between items-start w-full">
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight tracking-wide group-hover:text-[#C9A52C] transition-colors duration-300">{title}</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">{lessons} lessons</p>
          </div>

          <div className="pt-2">
            <ProgressRing progress={parseFloat(progress).toFixed(0)} />
          </div>
        </div>

        <div className={`${isFullWidth ? 'w-28 h-28' : 'w-20 h-20'} transition-transform duration-500 ease-out group-hover:scale-[1.08] flex-shrink-0 ml-4`}>
          <img src={image} alt={title} className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" />
        </div>
      </div>
    </div>
  );
};

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
    <div className="p-8 max-w-7xl mx-auto bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200/50">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-normal">
          Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A52C] via-[#e5c04f] to-[#C9A52C] font-black drop-shadow-sm">{Cookies.get("fullName")}</span>, welcome back!
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/create-interview">
            <button className="relative overflow-hidden bg-[#C9A52C] hover:bg-[#b59220] text-[#1B4332] font-black py-3 px-6 rounded-full transition-all duration-300 shadow-[0_4px_12px_rgba(201,165,44,0.25)] hover:shadow-[0_6px_20px_rgba(201,165,44,0.35)] flex items-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98] group">
              {/* Shimmer overlay */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#1B4332]">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
              Start Practice Interview
            </button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Content */}
        <div className="flex-1">
          {/* Mock Cards Grid */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">My Interviews</h2>

            {/* Deep Green Gradient Container for Cards */}
            <div className="bg-gradient-to-br from-[#1B4332] to-[#0a1b14] p-8 rounded-3xl relative shadow-[inset_0_1px_3px_rgba(255,255,255,0.05),_0_20px_40px_rgba(0,0,0,0.15)] border border-[#1b4332]/50 overflow-hidden">
              {/* Background abstract elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A52C]/5 rounded-full filter blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1B4332]/10 rounded-full filter blur-[80px] pointer-events-none" />

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
                      gradient={item.gradient}
                      image={item.image}
                      isFullWidth={index === 4}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
          {/* Statistics Section */}
          <div className="bg-gradient-to-br from-[#112A1F] to-[#0a1c14] text-white p-6 rounded-2xl border border-[#1B4332]/35 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A52C]/5 rounded-full filter blur-[30px]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A52C] mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.06] hover:border-[#C9A52C]/20 transition-all duration-300 group">
                <h3 className="text-white/40 text-[9px] uppercase tracking-widest mb-2 font-bold group-hover:text-white/60 transition-colors">Completed</h3>
                <p className="text-3xl font-extrabold text-[#C9A52C] drop-shadow-[0_0_8px_rgba(201,165,44,0.35)] group-hover:scale-105 transition-transform duration-300">{formatCount(stats.completed)}</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.06] hover:border-[#C9A52C]/20 transition-all duration-300 group">
                <h3 className="text-white/40 text-[9px] uppercase tracking-widest mb-2 font-bold group-hover:text-white/60 transition-colors">In Progress</h3>
                <p className="text-3xl font-extrabold text-[#C9A52C] drop-shadow-[0_0_8px_rgba(201,165,44,0.35)] group-hover:scale-105 transition-transform duration-300">{formatCount(stats.inProgress)}</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-gradient-to-br from-[#112A1F] to-[#0a1c14] text-white p-6 rounded-2xl border border-[#1B4332]/35 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A52C]/5 rounded-full filter blur-[30px]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A52C] mb-4">Leaderboard</h2>
            <div className="flex -space-x-2.5 mb-5 items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#112A1F] bg-[#1a4332] text-white/90 flex items-center justify-center text-xs font-bold shadow-md transition-transform hover:scale-105 hover:z-30 cursor-pointer">
                AB
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#C9A52C] bg-gradient-to-br from-[#C9A52C] to-[#a1821b] flex items-center justify-center text-sm font-black text-[#112A1F] shadow-[0_0_15px_rgba(201,165,44,0.3)] z-20 scale-110 transition-transform hover:scale-115 cursor-pointer">
                DC
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#112A1F] bg-[#1a4332] text-white/90 flex items-center justify-center text-xs font-bold shadow-md transition-transform hover:scale-105 hover:z-30 cursor-pointer">
                KS
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#C9A52C] to-[#e8c346] text-[#112A1F] font-black py-2.5 px-5 rounded-full flex items-center justify-between shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <span className="text-sm font-black tracking-wide">#5829</span>
              <span className="text-[10px] uppercase tracking-widest font-black">{Cookies.get("fullName") || "User"}</span>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-gradient-to-br from-[#112A1F] to-[#0a1c14] text-white p-6 rounded-2xl border border-[#1B4332]/35 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A52C]/5 rounded-full filter blur-[30px]" />
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A52C]">Activity</h2>
              <div className="flex bg-white/[0.03] p-1 rounded-full border border-white/[0.06] gap-1">
                <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-[#C9A52C] to-[#e8c346] text-[#112A1F] shadow-sm transition-all duration-300">Day</button>
                <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300">Week</button>
                <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300">Month</button>
              </div>
            </div>
            <div className="flex justify-between items-end bg-white/[0.02] border border-white/[0.05] p-5 rounded-xl">
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
