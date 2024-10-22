import { Button } from '@material-tailwind/react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie'

const EducationalDetails = ({semester, section, course, branch}) => {
    const [currSem, setCurrSem] = useState(semester); 
    const [currSec, setCurrSec] = useState(section);
    const [currCourse, setCurrCourse] = useState(course); 
    const [currBranch, setCurrBranch] = useState(branch) 

    console.log(currSem)

    const handleUpdate = async () => {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update-student-data-profile`, {section: currSec, semester: currSem, branch: currBranch, course: currCourse},

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
    <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Educational Details</h2>
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Course</h3>
                <select defaultValue={currCourse} onChange={(e) => setCurrCourse(e.target.value)} className="w-full p-2 border rounded">
                    <option value="BTech">BTech</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    
                </select>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Branch</h3>
                <select defaultValue={currBranch} onChange={(e) => setCurrBranch(e.target.value)} className="w-full p-2 border rounded">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Electronics Engineering">Electronics Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                </select>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Semester</h3>
                <select defaultValue={currSem} onChange={(e) => setCurrSem(e.target.value)} className="w-full p-2 border rounded">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                </select>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Section</h3>
                <select defaultValue={currSec} onChange={(e) => setCurrSec(e.target.value)} className="w-full p-2 border rounded">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                    <option value="H">H</option>
                    <option value="I">I</option>
                    <option value="J">J</option>
                    <option value="K">K</option>
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="N">N</option>
                    <option value="O">O</option>
                    <option value="P">P</option>
                    <option value="Q">Q</option>
                    <option value="R">R</option>
                    <option value="S">S</option>
                    <option value="T">T</option>
                    <option value="U">U</option>
                    <option value="V">V</option>
                    <option value="W">W</option>
                    <option value="X">X</option>
                    <option value="Y">Y</option>
                    <option value="Z">Z</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
            <div className="mt-4 flex justify-center">
                <Button onClick={handleUpdate} className="bg-[#2b6030] hover:bg-[#1c3d1f]" ripple={true}>
                    Update Now
                </Button>
            </div>
        </div>
    </div>
)};

export default EducationalDetails;
