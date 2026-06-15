import { Button } from '@material-tailwind/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const Resume = ({ resume, onUpdate }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [resumePreview, setResumePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (resume && resume !== 'path/to/resume.pdf') {
            setResumePreview(`${import.meta.env.VITE_BACKEND_URL}${resume}`);
        } else {
            setResumePreview(null);
        }
    }, [resume]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error("Please select a PDF file");
                return;
            }
            setResumeFile(file);
            setResumePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        if (!resumeFile) {
            toast.warning("Please choose a PDF file first");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("resume", resumeFile);

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update-student-personal-data-profile`, formData, {
                headers: {
                    Authorization: `Bearer ${Cookies.get('accessToken')}`
                }
            });

            if (response.status === 200) {
                toast.success("Resume updated successfully");
                setResumeFile(null);
                if (onUpdate) onUpdate();
            } else {
                toast.error("Failed to update resume");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update resume");
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDelete = async () => {
        if (resumeFile) {
            // Cancel local selection
            setResumeFile(null);
            if (resume && resume !== 'path/to/resume.pdf') {
                setResumePreview(`${import.meta.env.VITE_BACKEND_URL}${resume}`);
            } else {
                setResumePreview(null);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else if (resume && resume !== 'path/to/resume.pdf') {
            // Delete saved resume from database
            try {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update-student-personal-data-profile`, 
                    { deleteResume: "true" }, 
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get('accessToken')}`
                        }
                    }
                );

                if (response.status === 200) {
                    toast.success("Resume deleted successfully");
                    setResumeFile(null);
                    setResumePreview(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    if (onUpdate) onUpdate();
                } else {
                    toast.error("Failed to delete resume");
                }
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to delete resume");
            }
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Resume</h2>
            <div className="grid gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Uploaded Resume</h3>
                    <div className="flex items-center mb-4">
                        <span className="mr-4 text-gray-700 font-medium">
                            {resumeFile ? resumeFile.name : (resume && resume !== 'path/to/resume.pdf' ? "Resume.pdf" : "No resume uploaded")}
                        </span>
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Button color="blue" size="sm" className="mr-2" onClick={triggerFileInput} ripple={true}>
                            Choose PDF
                        </Button>
                        {(resumeFile || (resume && resume !== 'path/to/resume.pdf')) && (
                            <Button color="red" size="sm" onClick={handleDelete} ripple={true}>
                                {resumeFile ? "Cancel Selection" : "Delete Resume"}
                            </Button>
                        )}
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        {resumePreview ? (
                            <iframe
                                src={resumePreview}
                                title="Resume Preview"
                                className="w-full h-[21rem]"
                            ></iframe>
                        ) : (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 h-[21rem]">
                                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <p className="text-gray-600 font-medium mb-1 text-center">No resume uploaded yet</p>
                                <p className="text-gray-400 text-sm text-center">Please choose a PDF file and click "Update Now" to save it.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <Button className="bg-[#2b6030] hover:bg-[#1c3d1f]" onClick={handleUpdate} ripple={true}>
                    Update Now
                </Button>
            </div>
        </div>
    );
};

export default Resume;
