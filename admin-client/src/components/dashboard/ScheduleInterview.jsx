
const ScheduleInterview = () => {
    return (<>

<div className="flex flex-col p-6 bg-white rounded-lg" style={{height: '100vh' , marginLeft : '20rem'}}>
      <div className="flex  justify-between w-full">
      <h1 className="text-2xl font-semibold mb-4">Company Mock Interview</h1>
      </div>

      <form className="flex justify-between flex-wrap">
        <div className="w-1/4">
            <div className="flex flex-col ">
                <label className="text-sm font-semibold">Name of the Interview</label>
                <input type="text" className="border border-gray-200 p-2 rounded-lg" />
            </div>
        </div>
        <div className="w-1/4">
            <div className="flex flex-col">
                <label className="text-sm font-semibold">Interview Date </label>
                <input type="date" className="border border-gray-200 p-2 rounded-lg" />
            </div>
        </div>  
        <div className="w-1/4">
            <div className="flex flex-col">
                <label className="text-sm font-semibold">Interview Slot </label>
                <div className="flex gap-2">
                    <div className="flex flex-col">
                <label className="text-xs font-semibold">From</label>
                <input type="time" className="border border-gray-200 p-2 rounded-lg" />
            </div>
            <div className="flex flex-col">
                <label className="text-xs font-semibold">To</label>
                <input type="time" className="border border-gray-200 p-2 rounded-lg" />
                </div>
                </div>
            </div>
        </div>
      </form>
      </div>
    
    </>
    )
    
}

export default ScheduleInterview;