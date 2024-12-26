import React from 'react';

function Card({ title, lessons, progress, color }) {
  return (
    <div className={`p-5 rounded-lg ${color} text-white flex justify-between items-center`}>
      <div>
        <h4 className="text-lg font-bold">{title}</h4>
        <p>{lessons}</p>
        <div className="mt-2">
          <div className="w-full bg-white rounded-full h-2.5">
            <div className="bg-white h-2.5 rounded-full" style={{ width: progress }}></div>
          </div>
          <p className="mt-1">{progress}</p>
        </div>
      </div>
      <img src="https://placehold.co/50x50" alt={`${title} image`} />
    </div>
  );
}

export default Card;
