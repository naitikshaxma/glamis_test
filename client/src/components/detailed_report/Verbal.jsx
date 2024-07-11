import React, { useState } from 'react';
import {
    Card, CardHeader, CardBody, Typography,
    Accordion, AccordionHeader, AccordionBody, Progress, IconButton
} from '@material-tailwind/react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@mui/material';


const verbalData = [
    { subject: 'Grammar', A: 90, fullMark: 100 },
    { subject: 'Clarity', A: 55, fullMark: 100 },
    { subject: 'Vocabulary', A: 12, fullMark: 100 },
];
const Verbal = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full rounded-lg">
                <div className="bg-lightBlue-500 rounded-t-lg p-4">
                    <Typography variant="h3">
                        Verbal Skills
                    </Typography>
                </div>
                <div className="flex flex-col lg:flex-row gap-6 p-4">
                    <div className="w-full lg:w-1/3">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={verbalData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                <Radar name="Verbal Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-2/3 space-y-2">
                        <Typography variant="body1"><strong>Communication:</strong> Measures the ability to convey information effectively.</Typography>
                        <Typography variant="body1"><strong>Listening:</strong> Evaluates how well the individual comprehends spoken information.</Typography>
                        <Typography variant="body1"><strong>Clarity:</strong> Assesses the lucidity of the spoken or written message.</Typography>
                        <Typography variant="body1"><strong>Grammar:</strong> Evaluates the correctness of language use.</Typography>
                        <Typography variant="body1"><strong>Vocabulary:</strong> Measures the range of words known and used correctly.</Typography>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Verbal;