import { Button } from '@material-tailwind/react';

const EducationalDetails = () => (
    <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Educational Details</h2>
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Course</h3>
                <input type="text" value="BTech" readOnly className="w-full p-2 border rounded bg-[#e6e6e6]" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Branch</h3>
                <input type="text" value="CSE" readOnly className="w-full p-2 border rounded bg-[#e6e6e6]" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Semester</h3>
                <select className="w-full p-2 border rounded">
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                    <option value="VI">VI</option>
                    <option value="VII">VII</option>
                    <option value="VIII">VIII</option>
                </select>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Section</h3>
                <select className="w-full p-2 border rounded">
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
                <Button className="bg-[#2b6030] hover:bg-[#1c3d1f]" ripple={true}>
                    Update Now
                </Button>
            </div>
        </div>
    </div>
);

export default EducationalDetails;
