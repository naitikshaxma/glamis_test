import React, { useState } from 'react'
import UrgeWithPleasureComponent from '../components/playground/countdown'
// import Visualizer from '../components/playground/AudioBlob'
import visualizerImg from "../assets/waveform.png"

function Playground() {
  const [clicked, setClicked] = useState(false)

  const handleClicked = () => {
    setClicked(!clicked)
  }

  return (
    <div className="flex h-screen">
        <div className="flex flex-col justify-center h-screen bg-gray-900 w-9/12 p-10">
          <h2 className='text-3xl my-3 text-center text-white'>AI Based Mock Interview</h2>
          <div className="shadow  bg-black bg-opacity-50 h-fit rounded-lg p-4">
            <div className="  flex timer">
            <UrgeWithPleasureComponent/>
            </div>
            <div className="flex justify-center items-center  question w-2/3 mx-auto bg-gray-200 shadow my-6 px-4 py-6 rounded-xl h-[15vh]">
              <p className='text-center'><span>Q1</span> What is React? How is it different from vanila Js?</p>
            </div>
            {/* <div className="  flex w-2/3 mx-auto my-2 justify-between actionBtns">
              <button className="  bg-blue-500 text-white px-4 py-2 rounded">Skip</button>
              <button className="  bg-blue-500 text-white px-4 py-2 rounded">Next</button>
            </div> */}
            {/* <div className="  flex justify-center audioVisual">
              <img src={visualizerImg} alt="" className='w-1/3' />
            </div> */}
            <div className="  flex justify-center my-2 toggleSpeak ">
              <button className={`${clicked?'bg-red-700':'bg-green-700'} border-none text-white px-4 py-2 rounded`} onClick={handleClicked}>
                {clicked? <span>Stop</span> : <span>Tap to Speak</span> }
                </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-screen bg-white w-3/12">
        </div>
    </div>
  )
}

export default Playground
