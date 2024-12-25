import React from 'react';

function StatisticCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-lg flex justify-between items-center">
      <h4 className="text-lg font-bold">{title}</h4>
      <span className="text-2xl font-bold text-blue-500">{value}</span>
    </div>
  );
}

export default StatisticCard;
