
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const OverallPerformance = () => {

    const performanceData = [
        { name: '12/12/2024', Average: 60, Current: 74, },
        { name: '12/12/2025', Average: 50, Current: 20, },
        { name: '12/12/2026', Average: 55, Current: 90, },
        { name: '12/12/2027', Average: 83, Current: 100, }
      ];

    return (
      <div className="shadow-md rounded-lg p-4">
        <h1 className="text-xl font-semibold">Overall Performance</h1>
        <div className="flex justify-between pt-6">
          <LineChart
            width={720}
            height={250}
            data={performanceData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Average" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Current" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>
    )
  }

  export default OverallPerformance;