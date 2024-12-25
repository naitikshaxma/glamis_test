import { Button } from '@material-tailwind/react';
import ProfilePic from '../../assets/avatar.jpeg';
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';

const PersonalDetails = ({name, rollNo, emailId, phoneNo, address}) => {
    const [currRollNo, setCurrRollNo] = useState(rollNo); 
    const [currAddress, setCurrAddress] = useState(address); 

    const handleUpdate = async () => {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users//update-student-personal-data-profile`, {rollNo: currRollNo , address: currAddress},

            {
                headers: {

                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('accessToken')}`
                }
            }
        );

        console.log(response)

        if(response.status === 200){
            toast("Update successful")
        } else{ 
            toast("Update failed")
        }

    }

    return (
    <div className="p-4 h-[38rem]">
        <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Student Name</h3>
                <input type="text" value={name} readOnly className="w-full p-2 border rounded bg-[#e6e6e6]" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">University Roll No</h3>
                <input type="text" defaultValue={rollNo} onChange={(e) => setCurrRollNo(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Email ID</h3>
                <input type="text" value={emailId} readOnly className="w-full p-2 border rounded bg-[#e6e6e6]" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <input type="text" defaultValue={address} onChange={(e) => setCurrAddress(e.target.value)} className="w-full p-2 border rounded" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Phone Number</h3>
                <div className="flex">
                    <div className="w-1/5 flex border rounded p-2 mr-2">
                        <img className='mr-2 h-10' src="https://img.icons8.com/color/48/india.png" alt="india" />
                        <input type="text" pattern="[0-9]*" value="+91" readOnly />
                    </div>
                    <input type="text" pattern="[0-9]*" value={phoneNo} readOnly className="w-4/5 p-2 border rounded bg-[#e6e6e6]" />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
                <div className="flex items-center">
                    <input type="file" className="p-2 border rounded" />
                    <img src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' alt="Profile Preview" className="w-[4rem] h-[4rem] rounded-full ml-4 border-2" />
                </div>
            </div>
        </div>

        <div className="mt-4 flex justify-center">
            <Button className="mt-8 bg-[#2b6030] hover:bg-[#1c3d1f]" onClick={handleUpdate} ripple={true}>
                Update Now
            </Button>
        </div>
    </div>
)};

export default PersonalDetails;
