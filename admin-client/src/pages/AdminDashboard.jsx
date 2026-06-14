import React, { useEffect, useState } from 'react';
import { Card, Typography, Button } from '@material-tailwind/react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

// Icons as simple SVG components
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <Card className="p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <Typography variant="small" className="font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </Typography>
        <Typography variant="h3" className="mt-1" style={{ color }}>
          {value}
        </Typography>
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: bgColor, color }}>
        {icon}
      </div>
    </div>
  </Card>
);

const QuickActionCard = ({ title, description, href, emoji }) => (
  <Link to={href}>
    <Card className="p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-100 h-full">
      <div className="text-3xl mb-2">{emoji}</div>
      <Typography variant="h6" color="blue-gray" className="mb-1">{title}</Typography>
      <Typography variant="small" color="gray">{description}</Typography>
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-xl p-6 mb-6 text-white shadow-lg">
        <Typography variant="h4" className="mb-1">
          {greeting()}, Admin! 👋
        </Typography>
        <Typography variant="paragraph" className="opacity-80">
          Here's what's happening with GLAMIS today.
        </Typography>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Total Interviews"
          value={stats?.totalInterviews ?? 0}
          icon={<CalendarIcon />}
          color="#1565c0"
          bgColor="#e3f2fd"
        />
        <StatCard
          title="Completed"
          value={stats?.endedInterview ?? 0}
          icon={<CheckIcon />}
          color="#2e7d32"
          bgColor="#e8f5e9"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingInterviews ?? 0}
          icon={<ClockIcon />}
          color="#e65100"
          bgColor="#fff3e0"
        />
        <StatCard
          title="Registered Students"
          value={stats?.totalStudents ?? 0}
          icon={<UsersIcon />}
          color="#6a1b9a"
          bgColor="#f3e5f5"
        />
      </div>

      {/* Middle Section: Interview Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Interview Breakdown */}
        <Card className="p-5 shadow-md">
          <Typography variant="h5" color="blue-gray" className="mb-4 border-b pb-2">
            📊 Interviews by Type
          </Typography>
          <div className="space-y-3">
            {[
              { label: 'Company Mock', value: stats?.interviewsByType?.company ?? 0, color: '#1565c0' },
              { label: 'Subject Based', value: stats?.interviewsByType?.subject ?? 0, color: '#2e7d32' },
              { label: 'Verbal Skills', value: stats?.interviewsByType?.verbal ?? 0, color: '#e65100' },
              { label: 'Written Skills', value: stats?.interviewsByType?.written ?? 0, color: '#6a1b9a' },
              { label: 'Svar', value: stats?.interviewsByType?.svar ?? 0, color: '#00838f' },
            ].map(item => {
              const total = stats?.totalInterviews || 1;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <Typography variant="small" className="font-medium text-gray-700">{item.label}</Typography>
                    <Typography variant="small" className="font-bold" style={{ color: item.color }}>
                      {item.value} ({pct}%)
                    </Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-5 shadow-md">
          <Typography variant="h5" color="blue-gray" className="mb-4 border-b pb-2">
            ⚡ Quick Actions
          </Typography>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard title="Company Mock" description="Schedule company-based interview" href="/admin/schedule/company" emoji="🏢" />
            <QuickActionCard title="Subject Based" description="Schedule subject interview" href="/admin/schedule/subject" emoji="📚" />
            <QuickActionCard title="Written Skills" description="Written assessment" href="/admin/schedule/written" emoji="✍️" />
            <QuickActionCard title="Verbal Skills" description="Communication round" href="/admin/schedule/verbal" emoji="🗣️" />
            <QuickActionCard title="Svar Interview" description="Audio-based interview" href="/admin/schedule/svar" emoji="🎤" />
            <QuickActionCard title="Review Board" description="View all interviews" href="/admin/review-board" emoji="📋" />
          </div>
        </Card>
      </div>

      {/* Bottom Section: Upcoming + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <Card className="p-5 shadow-md">
          <Typography variant="h5" color="blue-gray" className="mb-4 border-b pb-2">
            📅 Upcoming Interviews
          </Typography>
          {stats?.upcomingInterviews?.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingInterviews.map((interview, index) => (
                <div key={interview._id || index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <Typography variant="small" className="font-bold text-green-900">
                      {interview.name}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {interview.company} • {interview.date} • {interview.from} - {interview.to}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {interview.candidates} candidates
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <span className="text-4xl mb-2">🎉</span>
              <Typography variant="small" color="gray">No upcoming interviews</Typography>
            </div>
          )}
        </Card>

        {/* Recent Completed */}
        <Card className="p-5 shadow-md">
          <Typography variant="h5" color="blue-gray" className="mb-4 border-b pb-2">
            ✅ Recently Completed
          </Typography>
          {stats?.recentInterviews?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInterviews.map((interview, index) => (
                <div key={interview._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Typography variant="small" className="font-bold text-gray-800">
                      {interview.name}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {interview.company} • {interview.date}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {interview.candidates} candidates
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <span className="text-4xl mb-2">📝</span>
              <Typography variant="small" color="gray">No completed interviews yet</Typography>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;