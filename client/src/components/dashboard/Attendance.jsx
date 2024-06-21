
import { PieChart, Pie, Cell } from 'recharts';

const Attendance = () => {

    const attendenceData = [
        { name: 'Present', value: 400, },
        { name: 'Absent', value: 300 },
        { name: 'Late', value: 300 },
        { name: 'Leave', value: 200 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
      <div className="shadow-md rounded-lg p-4">
        <h1 className="text-xl font-semibold">Attendance</h1>
        <div className="flex justify-between pt-6">
          <PieChart width={300} height={300}>
            <Pie dataKey="value" data={attendenceData} cx={170} outerRadius={100} fill="#8884d8" label>
              {
                attendenceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
              }
            </Pie>
          </PieChart>
        </div>
      </div>
    )
  }


export default Attendance;