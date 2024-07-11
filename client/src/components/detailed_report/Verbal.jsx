import React from 'react';
import {
    Card, CardBody, Typography
} from '@material-tailwind/react';
import { ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';


const data = [
    {
        name: 'Grammar', score: 80
    },
    {
        name: 'Vocabulary', score: 70
    },
]
const Verbal = () => {
    return (
        <div className="flex w-1/3 flex-col lg:flex-row gap-4 my-3">
            <Card className="w-full rounded-lg shadow-lg">
                <div className="bg-lightBlue-500 rounded-t-lg p-4">
                    <Typography variant="h3">Verbal Skills</Typography>
                </div>
                <CardBody className="flex flex-col items-center space-y-4 p-4">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart width={730} height={250} data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="score" fill="#2b6030" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </div>
    );
}

export default Verbal;