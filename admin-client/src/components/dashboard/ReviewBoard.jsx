import React from 'react'
import { Card, Typography } from "@material-tailwind/react";
import { Link } from 'react-router-dom';

const TABLE_HEAD = ["S.no", "Company", "Date", "Slot", "Candidates", "Status"];

const TABLE_ROWS = [
    {
        InterviewId : 1,
        Company: "JP Morgan",
        Date: "12/08/2024",
        Slot: "10:00-11:00",
        Candidates: 59,
        Status: "Scheduled"

    },
    {
        InterviewId : 2,
        Company: "Tech Mahindra",
        Date: "12/08/2024",
        Slot: "09:00-11:00",
        Candidates: 200,
        Status: "Completed"
    },
    {
        InterviewId : 3,
        Company: "Capgimini",
        Date: "12/08/2024",
        Slot: "10:00-11:00",
        Candidates: 15,
        Status: "Scheduled"
    },
    {
        InterviewId : 4,
        Company: "TCS",
        Date: "12/08/2024",
        Slot: "10:00-11:00",
        Candidates: 500,
        Status: "Completed"
    },
    {
        InterviewId : 5,
        Company: "Accenture",
        Date: "12/08/2024",
        Slot: "10:00-11:00",
        Candidates: 50,
        Status: "Scheduled"
    }
];

const TABLE_HEAD2 = [ "Rank" , "Name" , "Score" , "Comapny"];

const TABLE_ROWS2 = [
    {
        Rank : 1,
        Name: "John Doe",
        Score: 90,
        Company: "JP Morgan"
    },
    {
        Rank : 2,
        Name: "Jane Doe",
        Score: 80,
        Company: "Tech Mahindra"
    },
    {
        Rank : 3,
        Name: "John Doe",
        Score: 70,
        Company: "Capgimini"
    },
    {
        Rank : 4,
        Name: "John Doe",
        Score: 60,
        Company: "TCS"
    },
    {
        Rank : 5,
        Name: "John Doe",
        Score: 50,
        Company: "Accenture"
    }
];



export default function ReviewBoard() {
  return (
    <div>
        <div className="flex flex-col p-6 bg-white rounded-lg" style={{height: '100vh' , marginLeft : '20rem'}}>
      <div className="flex  justify-between w-full border-b pb-2">
      <h1 className="text-2xl font-semibold mb-4">Review Board</h1>
      </div>
      <div className="flex justify-between w-full">
        <div className="w-1/3">
            <div className='flex flex-col m-3 border p-3 rounded-lg bg-gray-100'>
                <p className='text-sm font-semibold'>Total Interview Scheduled</p>
                <p className='text-2xl font-semibold text-green-900'>20</p>
            </div>
        </div>
        <div className="w-1/3">
            <div className='flex flex-col m-3 border p-3 rounded-lg bg-gray-100'>
                <p className='text-sm font-semibold'>Total Interview Conducted</p>
                <p className='text-2xl font-semibold text-yellow-900'>18</p>
            </div>
        </div>
        <div className="w-1/3">
            <div className='flex flex-col m-3 border p-3 rounded-lg bg-gray-100'>
                <p className='text-sm font-semibold'>Total Interview Pending</p>
                <p className='text-2xl font-semibold text-red-900'>2</p>
            </div>
        </div>
    </div>
    <div className="flex justify-between w-full">
        <div className='w-2/3'>
            <div className="flex flex-col m-3 border p-3 rounded-lg bg-gray-100">
               {/* a table with a filter feature */}
                <div className="flex justify-between">
                     <h1 className="text-lg font-semibold">Interview Scheduled</h1>
                     <div className="flex gap-2">

                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 my-2 cursor-pointer">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
</svg>

                     <input type="text" placeholder="Search" className="border border-gray-200 p-2 rounded-lg"/>    
                     </div>
                    </div>
                    <Card className="h-full w-full overflow-scroll my-3">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th
                key={head}
                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
              >
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal leading-none opacity-70"
                >
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map(({ 
            InterviewId, Company, Date, Slot, Candidates, Status, URL
           }, index) => {
            const isLast = index === TABLE_ROWS.length - 1;
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
 
            return (
              <tr key={name}>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {InterviewId}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    <Link to="" className='text-blue-500'>{Company}</Link>
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {Date}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    as="a"
                    href="#"
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    {Slot}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {Candidates}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color= {Status === "Scheduled" ? "green" : "orange"}
                    className="font-normal"
                  >
                    {Status}
                  </Typography>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
                </div>
                </div>

        <div className='w-1/3'>
            <div className="flex flex-col m-3 border p-3 rounded-lg bg-gray-100">
                <div className="flex justify-between">
                <h1 className="text-lg font-semibold">Top students leaderboard</h1>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 my-2 cursor-pointer">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
</svg>
                </div>
                <Card className="h-full w-full overflow-scroll my-3">
        <table className="w-full min-w-max table-auto text-left">
            < thead>
                <tr>
                    {TABLE_HEAD2.map((head) => (
                        <th
                            key={head}
                            className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                        >
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                            >
                                {head}
                            </Typography>
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {TABLE_ROWS2.map(({ Rank, Name, Score, Company }, index) => {
                    const isLast = index === TABLE_ROWS2.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={Name}>
                            <td className={classes}>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    {Rank}
                                </Typography>
                            </td>
                            <td className={classes}>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    {Name}
                                </Typography>
                            </td>
                            <td className={classes}>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    {Score}
                                </Typography>
                            </td>
                            <td className={classes}>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    {Company}
                                </Typography>
                            </td>
                        </tr>
                    );
                })}
            </tbody>

            </table>
            </Card>
            </div>
        </div>

        </div>
      </div>
    </div>
  )
}
