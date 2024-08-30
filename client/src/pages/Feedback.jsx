import React from 'react'
import { FormInput, Select, Option, Button, Typography } from '@material-tailwind/react'
import { useState } from 'react'

export default function Feedback() {
  return (
    <div className="flex flex-col w-full p-6 bg-white rounded-lg">
      <div className="flex justify-between w-full border-b-2 pb-4">
      <h1 className="text-2xl font-semibold mb-4">Feedback</h1>
        </div>
        {/* <div className="flex-grow overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <FormInput
                                    label="Interview Name"
                                    value={interviewName}
                                    onChange={(e) => setInterviewName(e.target.value)}
                                    placeholder="Interview Name"
                                />
                                <FormInput
                                    label="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Company Name"
                                />
                                <FormInput
                                    label="Date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <FormInput
                                    label="Duration (From)"
                                    type="time"
                                    value={duration.from}
                                    onChange={(e) => setDuration({ ...duration, from: e.target.value })}
                                />
                                <FormInput
                                    label="Duration (To)"
                                    type="time"
                                    value={duration.to}
                                    onChange={(e) => setDuration({ ...duration, to: e.target.value })}
                                />
                                <div className="flex flex-col">
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                        Position
                                    </Typography>
                                    <Select
                                        value={position}
                                        onChange={(value) => setPosition(value)}
                                        className="!border-blue-gray-200 focus:!border-gray-900 py-2 px-3 rounded-md"
                                        placeholder="Select Position"
                                    >
                                        {softwarePositions.map((pos) => (
                                            <Option key={pos} value={pos}>
                                                {pos}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <FormInput
                                    label="No. of Questions"
                                    type="number"
                                    value={noOfQuestions}
                                    onChange={(e) => setNoOfQuestions(e.target.value)}
                                    placeholder="Number of Questions"
                                    max={20}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <FormInput
                                    label="Easy"
                                    type="number"
                                    value={easy}
                                    onChange={(e) => setEasy(e.target.value)}
                                    max={8}
                                />
                                <FormInput
                                    label="Medium"
                                    type="number"
                                    value={medium}
                                    onChange={(e) => setMedium(e.target.value)}
                                    max={7}
                                />
                                <FormInput
                                    label="Hard"
                                    type="number"
                                    value={hard}
                                    onChange={(e) => setHard(e.target.value)}
                                    max={5}
                                />
                            </div>
                            <div className="flex space-x-4 mb-6">
                                <div className="flex flex-col">
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                        Upload Student EmailIDs
                                    </Typography>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-[#2c6031] file:text-white hover:file:bg-[#1f4d26]"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                        Download Sample CSV
                                    </Typography>
                                    <Button
                                        size="sm"
                                        onClick={handleDownloadSampleCSV}
                                        className="bg-[#2c6031] text-white hover:bg-[#1f4d26] transition-colors duration-300"
                                    >
                                        Show Sample CSV
                                    </Button>
                                </div>
                            </div>
                            </div> */}

        // make the form for feedback include the following fields:
        // 1. Student Name
        // 2. Student Email
        // 3. Interview type (company/core/Verbal/written)
        // 4. mobile
        // 5. rating (1-10) user experience
        // 6. rating (1-10) quesion relevsnce
        // 7. rating (1-10) question difficulty
        // 8. rating (1-10) overall experience
        // 9. feedback (text area)
        // 10. submit button


        {/* <div className="flex justify-between flex-wrap">

        <div className="w-1/3">

        <FormInput

        label="Student Name"

        placeholder="Student Name"

        />

        <FormInput

        label="Student Email"

        placeholder="Student Email"

        />


        <FormInput

        label="Interview Type"

        placeholder="Interview Type"

        />

        <FormInput

        label="Mobile"

        placeholder="Mobile"

        />

        <FormInput

        label="Rating (1-10) User Experience"

        placeholder="Rating (1-10) User Experience"

        /> */}
        </div>
  )
}
