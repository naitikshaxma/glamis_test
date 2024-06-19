import { Button } from '@material-tailwind/react';

const PersonalDetails = () => (
    <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Student Name</h3>
                <input type="text" value="Anik Roy" readOnly className="w-full p-2 border rounded bg-[#e6e6e6]" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">University Roll No</h3>
                <input type="text" value="123456789" readOnly className="w-full p-2 border rounded bg-[#e6e6e6]" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Email ID</h3>
                <input type="text" value="anik@example.com" className="w-full p-2 border rounded" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <input type="text" value="123, Address, City, State" className="w-full p-2 border rounded" />
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Phone Number</h3>
                <input type="text" pattern="[0-9]*" value="+91" readOnly className="w-1/12 p-2 border rounded text-center" />
                <input type="text" pattern="[0-9]*" value="1234567890" className="w-11/12 p-2 border rounded" />
            </div>
            <div className="mt-4 flex justify-center">
                <Button className="bg-[#2b6030] hover:bg-[#1c3d1f]" ripple={true}>
                    Update Now
                </Button>
            </div>
        </div>
    </div>
);

export default PersonalDetails;
