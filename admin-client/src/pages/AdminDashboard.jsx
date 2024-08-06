import React from 'react'
import Sidebar from '../components/globalComponents/Sidebar'
import ScheduleInterview from '../components/dashboard/ScheduleInterview'
import ReviewBoard from '../components/dashboard/ReviewBoard'

const AdminDashboard = () => {
  return (
    <>
    <Sidebar/>
    <ReviewBoard/>
    </>
  )
}

export default AdminDashboard