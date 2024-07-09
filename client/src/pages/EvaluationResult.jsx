import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardBody, Typography } from '@material-tailwind/react';

const EvaluationResult = ({ data }) => {
    const totalScore = data.reduce((sum, result) => sum + result.score, 0) / data.length;

    const donutData = [
        { name: 'Score', value: totalScore },
        { name: 'Remaining', value: 100 - totalScore }
    ];

    const COLORS = ['#0088FE', '#FFBB28'];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md mx-auto mb-4 shadow-lg">
                <CardBody>
                    <Typography variant="h5" color="blue-gray" className="mb-4">
                        Evaluation Result
                    </Typography>
                    <div className="flex items-center justify-center">
                        <PieChart width={200} height={200}>
                            <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {donutData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                    <Typography variant="h6" color="gray" className="mt-4">
                        {`Average Score: ${totalScore.toFixed(2)}/100`}
                    </Typography>
                    <Typography variant="body1" color="gray" className="mt-2">
                        {data.map((result, index) => (
                            <div key={index} className="mb-2">
                                <strong>Question {index + 1}:</strong> {result.explanation}
                            </div>
                        ))}
                    </Typography>
                </CardBody>
            </Card>
        </div>
    );
};

export default EvaluationResult;
