import React from 'react';

function UpcomingItem({ title, time }) {
  return (
    <div className="bg-white p-5 rounded-lg flex justify-between items-center">
      <div className="flex items-center">
        <i className="fas fa-book-open text-blue-500 mr-3"></i>
        <div>
          <h4 className="text-lg font-bold">{title}</h4>
          <p className="text-gray-500">{time}</p>
        </div>
      </div>
      <i className="fas fa-ellipsis-v text-gray-500"></i>
    </div>
  );
}

export default UpcomingItem;
