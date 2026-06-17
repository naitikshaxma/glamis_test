import React, { useEffect, useState } from 'react';
import { Card, Typography, Button } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

// Icons as simple SVG components
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const StatCard = ({ title, value, icon, color, borderColor }) => (
  <Card className={`p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor} hover:shadow-md transition-shadow duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <Typography variant="small" className="font-medium text-gray-500 text-xs uppercase tracking-wider">
          {title}
        </Typography>
        <Typography variant="h3" className="mt-1 text-gray-800">
          {value}
        </Typography>
      </div>
      <div className="p-2.5 rounded-lg bg-gray-50" style={{ color }}>
        {icon}
      </div>
    </div>
  </Card>
);

const QuickActionCard = ({ title, description, href, emoji, bgClass, borderClass }) => (
  <Link to={href}>
    <Card className={`p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer ${bgClass} ${borderClass} flex flex-col justify-center`}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm text-2xl">{emoji}</div>
      <Typography variant="h6" className="font-bold text-gray-800 mb-1">{title}</Typography>
      <Typography variant="small" className="text-gray-500">{description}</Typography>
    </Card>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/stats`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get('accessTokenAdmin')}`
            }
          }
        );
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <Typography variant="h6" color="gray">Loading Dashboard...</Typography>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h4" className="mb-1 font-bold">
              {greeting()}, Admin! 👋
            </Typography>
            <Typography variant="paragraph" className="opacity-80">
              Here's what's happening with GLAMIS today.
            </Typography>
          </div>
          <div className="hidden md:block text-right">
            <Typography variant="small" className="opacity-70 text-xs uppercase tracking-wider">
              Today
            </Typography>
            <Typography variant="small" className="font-medium opacity-90">
              {todayDate}
            </Typography>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Interviews" value={stats?.totalInterviews ?? 0} icon={<CalendarIcon />} color="#1565c0" borderColor="border-l-blue-500" />
        <StatCard title="Completed" value={stats?.endedInterview ?? 0} icon={<CheckIcon />} color="#2e7d32" borderColor="border-l-green-500" />
        <StatCard title="Pending" value={stats?.pendingInterviews ?? 0} icon={<ClockIcon />} color="#e65100" borderColor="border-l-orange-500" />
        <StatCard title="Registered Students" value={stats?.totalStudents ?? 0} icon={<UsersIcon />} color="#6a1b9a" borderColor="border-l-purple-500" />
      </div>

      {/* Middle Section: Interview Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Interview Breakdown */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm p-6 h-full">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">📊</span>
            <h3 className="font-bold text-gray-800 text-base">
              Interviews by Type
            </h3>
          </div>

          <div className="flex flex-col justify-between h-[calc(100%-48px)] pb-2">
            {[
              { label: 'Company Mock', count: stats?.interviewsByType?.company || 0, gradient: 'from-blue-400 to-blue-500' },
              { label: 'Subject Based', count: stats?.interviewsByType?.subject || 0, gradient: 'from-purple-300 to-purple-500' },
              { label: 'Verbal Skills', count: stats?.interviewsByType?.verbal || 0, gradient: 'from-orange-400 to-orange-500' },
              { label: 'Written Skills', count: stats?.interviewsByType?.written || 0, gradient: 'from-green-300 to-green-500' },
              { label: 'Svar', count: stats?.interviewsByType?.svar || 0, gradient: 'from-pink-300 to-pink-500' },
            ].map((item) => {
              const total = stats?.totalInterviews || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                      <span className="text-xs bg-gray-100/80 text-gray-500 px-1.5 py-0.5 rounded-full">{pct}%</span>
                    </div>
                  </div>
                  {/* Glass Track */}
                  <div className="w-full bg-gray-200/40 rounded-full h-7 border border-white/60 shadow-inner relative overflow-hidden backdrop-blur-sm">
                    {/* Glass Fill */}
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient} relative progress-shimmer opacity-90 overflow-hidden`}
                      style={{ 
                        width: `${pct}%`,
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Glossy Top Reflection */}
                      <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 rounded-xl shadow-sm border border-gray-100">
          <Typography variant="h6" className="font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            ⚡ Quick Actions
          </Typography>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionCard title="Company Mock" description="Schedule company-based interview" href="/admin/schedule/company" emoji="🏢" bgClass="bg-gradient-to-br from-blue-50 to-blue-100" borderClass="border border-blue-200" />
            <QuickActionCard title="Subject Based" description="Schedule subject interview" href="/admin/schedule/subject" emoji="📚" bgClass="bg-gradient-to-br from-purple-50 to-purple-100" borderClass="border border-purple-200" />
            <QuickActionCard title="Written Skills" description="Written assessment" href="/admin/schedule/written" emoji="✍️" bgClass="bg-gradient-to-br from-orange-50 to-orange-100" borderClass="border border-orange-200" />
            <QuickActionCard title="Verbal Skills" description="Communication round" href="/admin/schedule/verbal" emoji="🗣️" bgClass="bg-gradient-to-br from-green-50 to-green-100" borderClass="border border-green-200" />
            <QuickActionCard title="Svar Interview" description="Audio-based interview" href="/admin/schedule/svar" emoji="🎤" bgClass="bg-gradient-to-br from-pink-50 to-pink-100" borderClass="border border-pink-200" />
            <QuickActionCard title="Review Board" description="View all interviews" href="/admin/review-board" emoji="📋" bgClass="bg-gradient-to-br from-yellow-50 to-yellow-100" borderClass="border border-yellow-200" />
          </div>
        </Card>
      </div>

      {/* Bottom Section: Upcoming + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <Card className="p-6 rounded-xl shadow-sm border border-gray-100">
          <Typography variant="h6" className="font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            📅 Upcoming Interviews
          </Typography>
          {stats?.upcomingInterviews?.length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {stats.upcomingInterviews.map((interview, index) => (
                <div key={interview._id || index} className={`flex items-center justify-between p-3.5 rounded-lg border ${interview.status === 'Active' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-100'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <Typography variant="small" className={`font-bold ${interview.status === 'Active' ? 'text-blue-900' : 'text-green-900'}`}>{interview.name}</Typography>
                      {interview.status === 'Active' ? (
                        <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Active</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Upcoming</span>
                      )}
                    </div>
                    <Typography variant="small" className="text-gray-500 mt-0.5">
                      {interview.company} • {interview.date} • {interview.from} - {interview.to}
                    </Typography>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`${interview.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} text-xs font-medium px-2.5 py-1 rounded-full`}>
                      {interview.candidates} candidate{interview.candidates !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <span className="text-5xl mb-3">🎉</span>
              <Typography variant="small" className="text-gray-400 font-medium">No upcoming interviews</Typography>
              <Typography variant="small" className="text-gray-300 mt-1">All caught up!</Typography>
            </div>
          )}
        </Card>

        {/* Recent Completed */}
        <Card className="p-6 rounded-xl shadow-sm border border-gray-100">
          <Typography variant="h6" className="font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            ✅ Recently Completed
          </Typography>
          {stats?.recentInterviews?.length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
              {stats.recentInterviews.map((interview, index) => (
                <div key={interview._id || index} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Typography variant="small" className="font-bold text-gray-800">{interview.name}</Typography>
                    <Typography variant="small" className="text-gray-500 mt-0.5">
                      {interview.company} • {interview.date}
                    </Typography>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {interview.candidates} candidate{interview.candidates !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <span className="text-5xl mb-3">📝</span>
              <Typography variant="small" className="text-gray-400 font-medium">No completed interviews yet</Typography>
              <Typography variant="small" className="text-gray-300 mt-1">Interviews will appear here once ended</Typography>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;