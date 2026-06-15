import React, { useEffect, useState } from 'react';
import { Spinner } from '@material-tailwind/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import avatar from "../assets/avatar.jpeg";

export default function AdminProfile() {
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({ totalInterviews: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState("account");

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false, newPw: false, confirm: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('accessTokenAdmin');
        
        // Fetch Profile
        const profileRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminData(profileRes.data);
        setNameInput(profileRes.data.name);

        // Fetch Stats
        const statsRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/stats`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

      } catch (error) {
        console.error("Failed to fetch admin data", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return toast.error("Name cannot be empty");

    setUpdating(true);
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/updateProfile`, 
      { name: nameInput },
      { headers: { Authorization: `Bearer ${Cookies.get('accessTokenAdmin')}` } });
      
      setAdminData({ ...adminData, name: response.data.name });
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all password fields");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 4) {
      return toast.error("New password must be at least 4 characters long");
    }

    setPasswordUpdating(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/reset-password`, 
      { oldPassword: currentPassword, newPassword: newPassword },
      { headers: { Authorization: `Bearer ${Cookies.get('accessTokenAdmin')}` } });
      
      toast.success("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium text-lg">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const joinDateFormatted = new Date(adminData.joinDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long'
  });

  const capitalizedName = adminData.name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const EyeToggle = ({ visible, onClick }) => (
    <button type="button" onClick={onClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
      {visible ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      {/* STEP 1: Page Header Banner */}
      <div className="w-full bg-gradient-to-r from-green-800 to-green-600 px-8 py-6 flex justify-between items-center">
        <div>
          <p className="text-white text-sm opacity-70 mb-1">Admin Panel / Profile</p>
          <h4 className="text-white font-bold text-2xl">Admin Profile</h4>
          <p className="text-white text-sm opacity-80 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="text-right">
            {/* Subtle info on right */}
            <p className="text-white text-xs opacity-70">Updated Info</p>
            <p className="text-white text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      {/* STEP 2: Main Content Area */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="col-span-1">
                {/* CARD 1: Identity Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                    <div className="relative">
                        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full ring-4 ring-green-500 ring-offset-2 object-cover" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mt-6">{capitalizedName}</h2>
                    <span className="inline-flex bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                        {adminData.role}
                    </span>
                    <hr className="w-full border-t border-gray-100 my-5" />
                    <div className="flex items-center gap-2 justify-center text-sm text-gray-500 w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        <span>Member since {joinDateFormatted}</span>
                    </div>
                    <button className="mt-5 w-full border border-gray-300 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 font-medium transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                        Change Photo
                    </button>
                </div>

                {/* CARD 2: Stats Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Overview</h3>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Interviews Scheduled</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{stats.totalInterviews}</span>
                    </div>

                    <hr className="w-full border-t border-gray-100 my-4" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Account Status</span>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-md">Active</span>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* TAB HEADER */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("account")}
                            className={`pb-3 px-6 pt-4 text-sm font-medium transition-colors ${
                            activeTab === "account"
                                ? "text-green-700 border-b-2 border-green-600"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Account Info
                        </button>
                        <button
                            onClick={() => setActiveTab("password")}
                            className={`pb-3 px-6 pt-4 text-sm font-medium transition-colors ${
                            activeTab === "password"
                                ? "text-green-700 border-b-2 border-green-600"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            Change Password
                        </button>
                    </div>

                    {/* TAB CONTENT */}
                    <div className="p-8">
                        {activeTab === "account" && (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                </svg>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={nameInput} 
                                                onChange={(e) => setNameInput(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                                </svg>
                                            </div>
                                            <input 
                                                type="email" 
                                                value={adminData.email} 
                                                disabled
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.733.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                                </svg>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={adminData.phone || 'N/A'} 
                                                disabled
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                                            {adminData.role}
                                        </span>
                                    </div>

                                </div>

                                <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Last saved changes will be reflected immediately</span>
                                    <button 
                                        type="submit" 
                                        disabled={updating}
                                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {updating && <Spinner className="h-4 w-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "password" && (
                            <form onSubmit={handleChangePassword}>
                                <div className="max-w-md">
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex items-start gap-2">
                                        <span className="text-blue-500">ℹ️</span>
                                        <p className="text-sm text-blue-700 font-medium">Password must be at least 4 characters long</p>
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </div>
                                                <input 
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwords.currentPassword}
                                                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="Enter current password"
                                                />
                                                <EyeToggle visible={showPasswords.current} onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </div>
                                                <input 
                                                    type={showPasswords.newPw ? "text" : "password"}
                                                    value={passwords.newPassword}
                                                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="Enter new password"
                                                />
                                                <EyeToggle visible={showPasswords.newPw} onClick={() => setShowPasswords({...showPasswords, newPw: !showPasswords.newPw})} />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </div>
                                                <input 
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwords.confirmPassword}
                                                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="Confirm new password"
                                                />
                                                <EyeToggle visible={showPasswords.confirm} onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} />
                                            </div>
                                            {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                                                <p className="text-red-500 mt-1.5 text-xs font-medium">Passwords do not match</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6 mt-6 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={passwordUpdating}
                                        className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {passwordUpdating && <Spinner className="h-4 w-4" />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
