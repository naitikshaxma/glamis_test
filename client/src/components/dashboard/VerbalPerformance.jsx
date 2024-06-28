import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const VerbalPerformance = () => {
    const data = [
        { date: "2021-01-01", grammar: 100, fluency: 80, pronunciation: 10, vocabulary: 100 },
        { date: "2021-01-02", grammar: 75, fluency: 85, pronunciation: 80, vocabulary: 90 },
        { date: "2021-01-03", grammar: 85, fluency: 80, pronunciation: 70, vocabulary: 88 },
        { date: "2021-01-04", grammar: 90, fluency: 88, pronunciation: 82, vocabulary: 92 },
    ];

    return (
        <div className="shadow-md rounded-lg p-4">
            <h1 className="text-xl font-semibold">Verbal Performance</h1>
            <div className="flex justify-between pt-6">
                <BarChart width={600} height={250} data={data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="grammar" stackId="a" fill="#8884d8" />
                    <Bar dataKey="fluency" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="pronunciation" stackId="a" fill="#ffc658" />
                    <Bar dataKey="vocabulary" stackId="a" fill="#ff8042" />
                </BarChart>
            </div>
        </div>
    );
};

export default VerbalPerformance;
