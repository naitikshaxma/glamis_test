import { Card, Typography } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
 
export default function Table() {
  const TABLE_HEAD = ["S.No", "Interview Name", "Time", "Result"];
   
  const TABLE_ROWS = [
    {
      title: "Full Stack Developer",
      time: "17.04PM",
      status: true
    },
    {
      title: "Full Stack Developer",
      time: "17.04PM",
      status: true
    },
    {
      title: "Full Stack Developer",
      time: "17.04PM",
      status: true
    },
    {
      title: "Full Stack Developer",
      time: "17.04PM",
      status: true
    },
    {
      title: "Full Stack Developer",
      time: "17.04PM",
      status: true
    }
  ];
   
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
          {TABLE_ROWS.map(({ title, time, status }, index) => (
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
              <td className="p-4 flex justify-center">
                <Button className="bg-[#2b6030]">{status?"View Result":"Expired"}</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}