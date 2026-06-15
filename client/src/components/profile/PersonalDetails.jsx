import { Button } from '@material-tailwind/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';

const PersonalDetails = ({ name, rollNo, emailId, phoneNo, address, avatar, onUpdate }) => {
    const [currRollNo, setCurrRollNo] = useState(rollNo);
    const [currAddress, setCurrAddress] = useState(address);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        setCurrRollNo(rollNo);
        setCurrAddress(address);
    }, [rollNo, address]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append("rollNo", currRollNo);
            formData.append("address", currAddress);
            if (photoFile) {
                formData.append("avatar", photoFile);
            }

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update-student-personal-data-profile`, formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('accessToken')}`
                    }
                }
            );

            console.log(response)

            if (response.status === 200) {
                toast.success("Update successful");
                if (onUpdate) onUpdate();
            } else {
                toast.error("Update failed");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Update failed");
        }
    }

    const getImageSrc = () => {
        if (photoPreview) return photoPreview;
        if (avatar && avatar !== 'path/to/avatar.png') {
            return `${import.meta.env.VITE_BACKEND_URL}${avatar}`;
        }
        return 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
    };

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
                    <input type="text" value={currRollNo} onChange={(e) => setCurrRollNo(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Email ID</h3>
                    <input type="text" value={emailId} readOnly className="w-full p-2 border rounded bg-[#e6e6e6]" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Address</h3>
                    <input type="text" value={currAddress} onChange={(e) => setCurrAddress(e.target.value)} className="w-full p-2 border rounded" />
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
                        <input type="file" accept="image/*" onChange={handleFileChange} className="p-2 border rounded" />
                        <img src={getImageSrc()} alt="Profile Preview" className="w-[4rem] h-[4rem] rounded-full ml-4 border-2 object-cover" />
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-center">
                <Button className="mt-8 bg-[#2b6030] hover:bg-[#1c3d1f]" onClick={handleUpdate} ripple={true}>
                    Update Now
                </Button>
            </div>
        </div>
    );
};

export default PersonalDetails;
