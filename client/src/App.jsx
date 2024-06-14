import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from './components/global_components/Sidebar';

function App() {

  return (
    <>
      <Router>  
        <Sidebar />
        <Routes>
          <Route path="/" element={<></>} />
          <Route path="/about" element={<h1>About</h1>} />
        </Routes>
      </Router>

      
    </>
  )
}

export default App
