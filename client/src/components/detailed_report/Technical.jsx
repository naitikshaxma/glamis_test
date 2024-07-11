import React, { useState, useRef, useEffect } from 'react';
import {
    Card, CardBody, Typography,
} from '@material-tailwind/react';
import {
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Link, Element, scroller } from 'react-scroll';


const COLORS = ['#529e5a', "#d63a3a"];
const technicalScore = [
    { name: 'Score', value: 80 },
    { name: 'Remaining', value: 20 },
];

export const questions = [
    {
        question: "Explain a project where you used React.",
        answer: "React is a popular open-source JavaScript library for building user interfaces, particularly for single-page applications where you want a fast, interactive user experience. Here are some key aspects of React: \n\n Component-Based Architecture: React is built around components, which are reusable pieces of UI that can manage their own state. Components can be nested, managed, and handled independently, promoting modular and maintainable code. \n\n Declarative Syntax: React uses a declarative paradigm, which makes it easier to reason about your application and aims to be both efficient and flexible. Developers can describe how the UI should look for different states, and React will efficiently update and render just the right components when the data changes.",
        feedback: {
            good: ["Answer was clear and concise", "Answer provided a good overview of React and its key features"],
            improvement: ["Could provide more specific examples of projects where React was used", "Could elaborate on personal experience with React and challenges faced"]
        }
    },
    {
        question: "Explain a project where you used Vue.",
        answer: "Vue is a progressive JavaScript framework for building user interfaces. Here are some key aspects of Vue: \n\n Reactivity: Vue's reactivity system allows for seamless data binding and efficient updates to the DOM. \n\n Single-File Components: Vue encourages the use of single-file components, which encapsulate HTML, CSS, and JavaScript, promoting a modular approach.",
        feedback: {
            good: ["Answer was clear and concise", "Answer provided a good overview of Vue and its key features"],
            improvement: ["Could provide more specific examples of projects where Vue was used", "Could elaborate on personal experience with Vue and challenges faced"]
        }
    },
    {
        question: "Explain a project where you used Next.",
        answer: "Vue is a progressive JavaScript framework for building user interfaces. Here are some key aspects of Vue: \n\n Reactivity: Vue's reactivity system allows for seamless data binding and efficient updates to the DOM. \n\n Single-File Components: Vue encourages the use of single-file components, which encapsulate HTML, CSS, and JavaScript, promoting a modular approach.",
        feedback: {
            good: ["Answer was clear and concise", "Answer provided a good overview of Vue and its key features"],
            improvement: ["Could provide more specific examples of projects where Vue was used", "Could elaborate on personal experience with Vue and challenges faced"]
        }
    },
    {
        question: "Explain a project where you used Remix.",
        answer: "Vue is a progressive JavaScript framework for building user interfaces. Here are some key aspects of Vue: \n\n Reactivity: Vue's reactivity system allows for seamless data binding and efficient updates to the DOM. \n\n Single-File Components: Vue encourages the use of single-file components, which encapsulate HTML, CSS, and JavaScript, promoting a modular approach.",
        feedback: {
            good: ["Answer was clear and concise", "Answer provided a good overview of Vue and its key features"],
            improvement: ["Could provide more specific examples of projects where Vue was used", "Could elaborate on personal experience with Vue and challenges faced"]
        }
    },
];

export const TechnicalCard = ({ question, answer, feedback }) => {
    return (
        <div className="flex  flex-col bg-lightBlue-500 rounded-lg p-4">
            <div className="flex flex-col space-y-2 font-semibold mb-4">
                Question: {question}
            </div>
            <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-2">
                    <strong>Your Answer:</strong>
                    {answer}
                </div>
                <div className="flex flex-col space-y-2 bg-lightblue-900 rounded-lg p-3">
                    <div className="flex flex-col space-y-2 font-semibold">Feedback</div>
                    <hr />
                    <div className='flex w-full justify-between font-semibold'>
                        <div className="flex flex-col space-y-2 font-semibold w-1/3">Attributes</div>
                        <div className="flex flex-col space-y-2 font-semibold w-2/3">Description</div>
                    </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">What went well</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className="list-disc">
                                {feedback.good.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <hr />
                    <div className='flex w-full justify-between'>
                        <div className="flex flex-col space-y-2 w-1/3">Areas for improvement</div>
                        <div className="flex flex-col space-y-2 w-2/3">
                            <ul className="list-disc">
                                {feedback.improvement.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <hr />
                </div>
                <div className="px-2">
                    <button className="bg-black text-white rounded-lg p-2 shadow-lg px-4 font-semibold">Expected Answer</button>
                </div>
            </div>
        </div>
    );
}

const Technical = () => {

    return (
        <div className="flex w-1/3 flex-col items-center m-3">
            <Card className="w-full rounded-lg shadow-lg">
                <div className="bg-lightBlue-500 rounded-t-lg p-4">
                    <Typography variant="h3">Technical Skills</Typography>
                </div>
                <CardBody className="flex flex-col items-center space-y-4 p-4">
                    <ResponsiveContainer width="50%" height={250}>
                        <PieChart>
                            <Pie data={technicalScore} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                {technicalScore.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <Typography variant="body1" className="my-2 text-green-900 font-semibold">Domain Knowledge: 80/100</Typography>
                </CardBody>
            </Card>
        </div>
    );
}

export default Technical;
