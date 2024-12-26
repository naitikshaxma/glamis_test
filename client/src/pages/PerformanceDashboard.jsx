import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CircularProgress = ({ value }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - value) / 100) * circumference;
  
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="stroke-slate-200"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
        <circle
          className="stroke-green-500 transition-all duration-300 ease-in-out"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-slate-700">{value}%</span>
    </div>
  );
};

const PerformanceDashboard = () => {
  const infographicData = [
    { month: 'Jan', productivity: 180, efficiency: 150, quality: 200 },
    { month: 'Feb', productivity: 160, efficiency: 170, quality: 180 },
    { month: 'Mar', productivity: 140, efficiency: 160, quality: 170 },
    { month: 'Apr', productivity: 130, efficiency: 140, quality: 150 },
    { month: 'May', productivity: 120, efficiency: 130, quality: 140 },
    { month: 'Jun', productivity: 140, efficiency: 150, quality: 160 },
    { month: 'Jul', productivity: 150, efficiency: 160, quality: 170 },
    { month: 'Aug', productivity: 140, efficiency: 150, quality: 160 },
    { month: 'Sep', productivity: 130, efficiency: 140, quality: 150 },
    { month: 'Oct', productivity: 150, efficiency: 160, quality: 170 },
  ];

  const performanceMetrics = [
    { name: 'DSA', score: 4.8 },
    { name: 'Operating System', score: 4.5 },
    { name: 'Computer Network', score: 4.3 },
    { name: 'DBMS', score: 4.6 },
    { name: 'Machine Learning', score: 4.7 },
    { name: 'Cyber Security', score: 4.4 },
    { name: 'Cloud Computing', score: 4.5 },
    { name: 'Web Development', score: 4.6 },
    { name: 'JAVA', score: 4.7 },
    { name: 'Python', score: 4.8 },
    { name: 'JavaScript', score: 4.6 }
  ];

  const skillCategories = [
    { category: 'Productivity', value: 85 },
    { category: 'Efficiency', value: 75 },
    { category: 'Domain Knowledge', value: 90 }
  ];

  return (
    <div className="w-full max-w-6xl p-4 bg-yellow-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Monthly Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Infographics by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={infographicData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productivity" fill="#4299e1" stackId="stack" />
                  <Bar dataKey="efficiency" fill="#48bb78" stackId="stack" />
                  <Bar dataKey="quality" fill="#ed64a6" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Lines */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={infographicData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="productivity" stroke="#4299e1" />
                  <Line type="monotone" dataKey="efficiency" stroke="#48bb78" />
                  <Line type="monotone" dataKey="quality" stroke="#ed64a6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Categories */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Skill Categories</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillCategories} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4299e1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Performance Gauge */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Overall Performance</h2>
            <div className="flex justify-center">
              <CircularProgress value={95} />
            </div>
          </div>

          {/* Leaderboard/Skills */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Skills Assessment</h2>
            <div className="space-y-2">
              {performanceMetrics.map((metric) => (
                <div key={metric.name} className="flex justify-between items-center">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-sm text-gray-600">★ {metric.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;