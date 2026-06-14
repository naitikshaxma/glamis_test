import React, { useEffect, useState } from 'react';
import { Card, Typography, Input, Button, Avatar } from '@material-tailwind/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import avatar from "../assets/avatar.jpeg";

export default function AdminProfile() {
  const [adminData, setAdminData] = useState({
    name: 'Demo Admin',
    email: 'admin@glamis.in',
    role: 'Super Administrator',
    joinDate: '2024-01-01',
    tokenBalance: 3
  });

  // In a real application, you would fetch the admin details from the backend here
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/profile`, {
  //         headers: {
  //           Authorization: `Bearer ${Cookies.get('accessTokenAdmin')}`
  //         }
  //       });
  //       setAdminData(response.data);
  //     } catch (error) {
  //       console.error("Failed to fetch admin profile", error);
  //     }
  //   };
  //   fetchProfile();
  // }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    // Simulate update
    alert("Profile update functionality would be triggered here.");
  };

  return (
    <div className="p-8 h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Typography variant="h3" color="blue-gray" className="mb-6">
          Admin Profile
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary */}
          <Card className="p-6 flex flex-col items-center text-center shadow-md">
            <Avatar src={avatar} alt="admin-avatar" size="xxl" className="mb-4 shadow-lg border-green-600 border-4" />
            <Typography variant="h5" color="blue-gray" className="mb-1">
              {adminData.name}
            </Typography>
            <Typography variant="small" color="gray" className="font-normal mb-4">
              {adminData.role}
            </Typography>
            
            <div className="w-full bg-blue-gray-50 rounded-lg p-4 mt-2">
               <div className="flex justify-between items-center mb-2">
                 <Typography variant="small" className="font-bold text-gray-700">Available Tokens</Typography>
                 <div className="flex items-center">
                   <Typography color="blue-gray" className="font-bold mr-2 text-lg">
                     {adminData.tokenBalance}
                   </Typography>
                   <img width="24" height="24" src="https://img.icons8.com/fluency/48/stack-of-coins--v1.png" alt="coins" />
                 </div>
               </div>
            </div>
          </Card>

          {/* Right Column: Edit Details */}
          <Card className="p-6 col-span-2 shadow-md">
            <Typography variant="h5" color="blue-gray" className="mb-6 border-b pb-2">
              Profile Settings
            </Typography>
            <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Full Name
                </Typography>
                <Input 
                  type="text" 
                  value={adminData.name} 
                  onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                  className="!border-t-blue-gray-200 focus:!border-gray-900" 
                  labelProps={{ className: "hidden" }} 
                />
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Email Address
                </Typography>
                <Input 
                  type="email" 
                  value={adminData.email} 
                  disabled
                  className="bg-gray-100 !border-t-blue-gray-200" 
                  labelProps={{ className: "hidden" }} 
                />
              </div>

              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Role
                </Typography>
                <Input 
                  type="text" 
                  value={adminData.role} 
                  disabled
                  className="bg-gray-100 !border-t-blue-gray-200" 
                  labelProps={{ className: "hidden" }} 
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="submit" className="bg-[#2c6031] hover:bg-[#1f4d26] text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
