import React, { useState } from 'react';
import {
  Card, Typography, CardBody
} from '@material-tailwind/react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


const data = [
  {
    name: "Intonation", score: 80
  },
  {
    name: "Clarity", score: 70
  },
  {
    name: "Fluency", score: 35
  }
]

const Behavioral = () => {
  return (
    <div className="flex w-1/3 flex-col lg:flex-row gap-6 m-3">
      <Card className="w-full h-full rounded-lg shadow-md">
        <div className="bg-lightBlue-500 rounded-t-lg p-4">
          <Typography variant="h3">
            Behavioral Skills
          </Typography>
        </div>
        <CardBody className="flex flex-col items-center space-y-4 p-4">
          <ResponsiveContainer width="100%" height={280}>

            <BarChart width={730} height={250} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#529e5a" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  )
}

export default Behavioral