import { Button } from '@material-tailwind/react';
import SamplePDF from '../../assets/sample.pdf';


const Resume = () => (
    <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Resume</h2>
        <div className="grid gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Uploaded Resume</h3>
                <div className="flex items-center mb-4">
                    <span className="mr-4">Resume.pdf</span>
                    <Button color="blue" size="sm" className="mr-2" ripple={true}>
                        Change
                    </Button>
                    <Button color="red" size="sm" ripple={true}>
                        Delete
                    </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <iframe
                        src={SamplePDF}
                        title="Resume Preview"
                        className="w-full h-[22rem]"
                    ></iframe>
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-center">
            <Button className="bg-[#2b6030] hover:bg-[#1c3d1f]" ripple={true}>
                Update Now
            </Button>
        </div>
    </div>
);

export default Resume;
