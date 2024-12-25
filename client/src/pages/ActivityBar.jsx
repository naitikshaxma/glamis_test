import React from 'react';

function ActivityBar({ day, height }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 ${height} bg-blue-500 rounded-lg mb-2`}></div>
      <span>{day}</span>
    </div>
  );
}

export default ActivityBar;
