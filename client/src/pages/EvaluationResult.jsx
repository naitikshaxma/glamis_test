import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const EvaluationResult = ({ data }) => {
    const navigate = useNavigate();
    const calculateAverage = (key) => {
        return data.reduce((sum, result) => sum + parseInt(result[key], 10), 0) / data.length;
    };

    const totalScore = calculateAverage('overallScore');
    const grammarScore = calculateAverage('grammarScore');
    const vocabularyScore = calculateAverage('vocabularyScore');

    const donutData = [
        { name: 'Score', value: totalScore },
        { name: 'Remaining', value: 100 - totalScore }
    ];

    const COLORS = ['#0088FE', '#FFBB28'];

    useEffect(() => {
        const saveResultToDB = async () => {
            console.log(data)
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/interview/saveResultToDb`, { data, interviewId: Cookies.get('interviewId') }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get('accessToken')}`
                }
            });
            console.log(response.data);

            setTimeout(() => {


                navigate(`/history/detailed/${Cookies.get('interviewId')}`);

            }, 7000)

        }

        saveResultToDB()
    })

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            Your Result will be Available at History Page
            <Link to="/history" className="text-white bg-green-800 px-4 py-2">Go to History</Link>
            <p className="text-2xl font-bold text-center">Please Wait...for 10 seconds</p>
            {/* <Card className="w-full max-w-md mx-auto mb-4 shadow-lg">
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
                        {`Average Overall Score: ${totalScore.toFixed(2)}/100`}
                    </Typography>
                    <Typography variant="h6" color="gray" className="mt-2">
                        {`Average Grammar Score: ${grammarScore.toFixed(2)}/100`}
                    </Typography>
                    <Typography variant="h6" color="gray" className="mt-2">
                        {`Average Vocabulary Score: ${vocabularyScore.toFixed(2)}/100`}
                    </Typography>
                    <div className="mt-4">
                        {data.map((result, index) => (
                            <div key={index} className="mb-4">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    {`Question ${index + 1}`}
                                </Typography>
                                <Typography variant="body1" color="gray">
                                    <strong>Question:</strong> {result.question}
                                </Typography>
                                <Typography variant="body1" color="gray">
                                    <strong>User Answer:</strong> {result.userAnswer}
                                </Typography>
                                <Typography variant="body1" color="gray">
                                    <strong>Technical Score:</strong> {result.overallScore}/100
                                </Typography>
                                <Typography variant="body1" color="gray">
                                    <strong>Grammar Score:</strong> {result.grammarScore}/100
                                </Typography>
                                <Typography variant="body1" color="gray">
                                    <strong>Vocabulary Score:</strong> {result.vocabularyScore}/100
                                </Typography>
                                <Typography variant="body1" color="gray">
                                    <strong>1. Technical: {result.technicalExplanation}</strong>
                                </Typography>
                                <Typography>
                                    <strong>2. Vocabulary: {result.vocabularyExplanation}</strong>
                                </Typography>
                                <Typography>
                                    <strong>3. Grammar: {result.grammarExplanation}</strong>
                                </Typography>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card> */}
        </div>
    );
};

export default EvaluationResult;
