import React from 'react';
// import NotificationsIcon from '@mui/icons-material/Notifications';
const Dashboard = () => {
  const mockMenuItems = [
    {
      title: "Interview by Company",
      lessons: "20",
      progress: "25",
      color: "bg-green-400",
      path: "/detailed-interview-stats",
      image: "Learning Foreign Languages 3D Illustration.png",
      // image: "Businessman Work On Laptop.png",
    },
    {
      title: "Interview by Subject",
      lessons: "40",
      progress: "75",
      color: "bg-yellow-400",
      path: "/performance-dashboard",
      image: "Businessman Work On Laptop.png",
    },
    {
      title: "SVAR",
      lessons: "35",
      progress: "75",
      color: "bg-blue-400",
      path: "/svar-dashboard",
      // image: "Group 53.png",
      image: "Group 48.png",
    },
    {
      title: "Writing",
      lessons: "30",
      progress: "50",
      color: "bg-orange-400",
      path: "/write-dashboard",
      image: "Group 53.png",
    },
    {
      title: "Verbal/Reading",
      lessons: "40",
      progress: "75",
      color: "bg-pink-400",
      path: "/verbal-dashboard",
      image: "Group 54.png",
    },
  ];

  const MockCard = ({ title, lessons, progress, color, image, onClick }) => (
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
              className="absolute inset-0 rounded-full border-4 border-white"
              style={{
                clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
              {progress}%
            </div>
          </div>
        </div>
        <div className="w-24 h-45"> {/* Increased from w-16 h-16 to w-24 h-24 */}
          <img src={image} alt={title} className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );

  const UpcomingItem = ({ icon, title, time }) => (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>
      <button className="text-gray-400">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );

  const ActivityBar = ({ day, height = "h-20", active = false }) => (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-8 ${height} ${active ? 'bg-green-700' : 'bg-gray-200'} rounded-full`}></div>
      <span className="text-sm text-gray-500">{day}</span>
    </div>
  );

  const handleCardClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Hello <span>Krishankant</span>, welcome back!
        </h1>
        <div className="flex items-center gap-4">
          <button className="relative">
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">1</span>
            {/* <img src="/api/placeholder/32/32" alt="Notifications" className="w-8 h-8" />  */}
            <i className="fas fa-bell w-8 h-8 text-gray-500"></i>

                {/* <NotificationsIcon className="w-8 h-8 text-gray-500" /> */}

            {/* Increased from w-6 h-6 to w-8 h-8 */}
          </button>
          <div className="flex items-center gap-2">
            <img src="k.jpg" alt="Profile" className="w-12 h-12 rounded-full" /> {/* Increased from w-10 h-10 to w-12 h-12 */}
            <span className="font-medium">Krishankant Saraswat</span>
            <button>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Content */}
        <div className="flex-1">
          {/* Mock Cards Grid */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">My Mock</h2>
            <div className="grid grid-cols-2 gap-4">
              {mockMenuItems.map((item, index) => (
                <MockCard
                  key={index}
                  title={item.title}
                  lessons={item.lessons}
                  progress={item.progress}
                  color={item.color}
                  image={item.image}
                  onClick={() => handleCardClick(item.path)}
                />
              ))}
            </div>
          </section>

          {/* Upcoming Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upcoming</h2>
              <div className="flex items-center gap-2">
              <i className="fas fa-calendar-alt w-8 h-8 text-gray-500" aria-label="Calendar"></i>
              {/* Increased from w-6 h-6 to w-8 h-8 */}
                <span className="text-blue-500">21 October 2024</span>
              </div>
            </div>
            <div className="space-y-4">
              <UpcomingItem 
                icon="📖"
                title="Reading - Beginner" 
                time="8:00 AM - 10:00 AM"
              />
              <UpcomingItem 
                icon="🎧"
                title="Listening - Intermediate" 
                time="03:00 PM - 04:00 PM"
              />
              <UpcomingItem 
                icon="🗣️"
                title="Speaking - Beginner" 
                time="8:00 AM - 12:00 PM"
              />
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
                <p className="text-3xl font-bold">02</p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-2">Interview In Progress</h3>
                <p className="text-3xl font-bold">03</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
          <div className="flex -space-x-2 mb-4 items-center justify-center">
            <img src="k.jpg" alt="User" className="w-12 h-12 rounded-full border-2 border-white z-10" />
            <img src="ytt.jpg" alt="User" className="w-17 h-16 rounded-full border-2 border-white z-20" />
            <img src="vin3.jpg" alt="User" className="w-12 h-12 rounded-full border-2 border-white z-10" />
          </div>
          <div className="bg-yellow-400 py-2 px-4 rounded-full flex items-center">
            <span className="mr-2">#5829</span>
            <span>Krishankant Saraswat</span>
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
              <ActivityBar day="Mon" />
              <ActivityBar day="Tues" />
              <ActivityBar day="Wed" />
              <ActivityBar day="Thurs" height="h-40" active={true} />
              <ActivityBar day="Fri" />
              <ActivityBar day="Sat" />
              <ActivityBar day="Sun" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;