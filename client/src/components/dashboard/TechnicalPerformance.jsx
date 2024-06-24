import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TechnicalPerformance = () => {
    const data = [
        { date: "2021-01-01", score: "score1", students: 400, fill: "#8884d8" },
        { date: "2021-01-02", score: "score2", students: 700, fill: "#82ca9d" },
        { date: "2021-01-03", score: "score3", students: 200, fill: "#ffc658" },
        { date: "2021-01-04", score: "score4", students: 1000, fill: "#ff8042" },
    ];

    return (
        <div className="shadow-md rounded-lg p-4">
            <h1 className="text-xl font-semibold">Technical Performance</h1>
            <div className="flex justify-between pt-6">
                <BarChart width={600} height={250} data={data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Legend />
                    <Tooltip />
                    <Bar dataKey="students" fill="#8884d8" />
                </BarChart>
            </div>
        </div>
    );
};

export default TechnicalPerformance;
