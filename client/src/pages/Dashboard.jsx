import React from 'react'
import Sidebar from '../components/global_components/Sidebar'
import MyInterview from './MyInterview'

const Dashboard = () => {
    return (
        <React.Fragment>
            <div className="flex">

        <Sidebar />
        <MyInterview/>
            </div>
        </React.Fragment>
    )
}

export default Dashboard