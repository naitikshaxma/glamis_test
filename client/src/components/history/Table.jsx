import { button, Card, Typography } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { resultPopupState } from "../../store/atoms/resultPopup";
import { useSetRecoilState } from "recoil";
import Tooltip from '@mui/material/Tooltip';
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

export default function Table() {
  const TABLE_HEAD = ["S.No", "Interview Name", "Time", 'status', "Result"];

  // const TABLE_ROWS = [
  //   {
  //     title: "Full Stack Developer",
  //     time: "17.04PM",
  //     status: true
  //   },
  //   {
  //     title: "Full Stack Developer",
  //     time: "17.04PM",
  //     status: false
  //   },
  //   {
  //     title: "Full Stack Developer",
  //     time: "17.04PM",
  //     status: false
  //   },
  //   {
  //     title: "Full Stack Developer",
  //     time: "17.04PM",
  //     status: true
  //   },
  //   {
  //     title: "Full Stack Developer",
  //     time: "17.04PM",
  //     status: true
  //   }
  // ];
  const setResultPopup = useSetRecoilState(resultPopupState);

  const [TABLE_ROWS, setTABLE_ROWS] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState(true);

  const axiosInstance = axios.create({
      baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
      },
  });

  useEffect(() => {
      const fetchInterviewHeld = async () => {
          try {
              const response = await axiosInstance.get('/interview/getInterviewsHeld');
              const responseData = response.data.data;

              console.log("Interviews held: ", responseData);

              const detailPromises = responseData.map(interviewId =>
                  axiosInstance.post('/interview/getPartialDetailsByInterviewId', {
                      "interviewId": interviewId
                  })
              );

              const detailsResponses = await Promise.all(detailPromises);

              const newTableRows = detailsResponses.map(detailResponse => ({
                  id: detailResponse.data.data.id,
                  title: detailResponse.data.data.title,
                  time: detailResponse.data.data.end_time,
                  status: false
              }));
              newTableRows.reverse();

              setTABLE_ROWS(prev => [...prev, ...newTableRows]);
          } catch (error) {
              console.log(error);
          }
      };

      const getUser = async ()=>{
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/get-user-data-profile`, {},
          {
            headers: {    
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Cookies.get('accessToken')}`
            }
          }
        );
        console.log(response)
        setFeedbackStatus(response.data.data.user.feedback_submitted);  
      }
        getUser();
        fetchInterviewHeld();
  }, []);



  return (
    <Card className="h-full w-full">
      <table className="w-full min-w-max table-auto text-left border-collapse bg-gray-100 rounded">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th key={head} className="border-b border-blue-gray-100 bg-[#2b6030] p-4 font-semibold">
                <Typography
                  variant="small"
                  className="font-semibold text-center text-white"
                >
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map(({ title, time, status, id }, index) => (
            <tr key={name} className="even:bg-blue-gray-50/50">
              <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-normal text-center">
                  {index + 1}
                </Typography>
              </td>
              <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-semibold text-center">
                  {title}
                </Typography>
              </td>
              <td className="p-4">
                <Typography variant="small" color="blue-gray" className="font-normal text-center">
                  {time}
                </Typography>
              </td>
              <td className="p-4">
                <Typography variant="small" color={status ? '#2b6030' : 'red'} className="font-normal text-center">
                  {status ? "Active" : "Expired"}
                </Typography>
              </td>
              <td className="p-4 flex justify-center">
                {/* <Link
                to={`/history/detailed/${id}`}
                // onClick={() => {
                //   if (!status) return;
                //   // setResultPopup(true);
                //   console.log(import.meta.env.VITE_FRONTEND_URL+"/history/detailed/"+id)
                //   // window.location.href = import.meta.env.VITE_FRONTEND_URL+"/history/detailed/"+id;
                // }}
                // className={`${status ? 'bg-[#2b6030] text-white font-semibold' : 'bg-gray-400 disabled text-black'} px-4 py-2`}>{status ? "View Result" : "Expired"}</Link>
                className='bg-[#2b6030] text-white font-semibold px-4 py-2' >View Result  </Link>
                 */}
                 {true ? <button className="bg-[#2b6030] text-white font-semibold px-4 py-2"><a href={`/history/detailed/${id}`}>View Result</a></button> : <Tooltip title="Please fill the feedback form"> <button className="bg-[#2b6030] text-white font-semibold px-4 py-2"><a href="/feedback">Feedback</a></button></Tooltip>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}