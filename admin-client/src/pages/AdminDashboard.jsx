import React from 'react'
import Sidebar from '../components/globalComponents/Sidebar'
import ScheduleInterview from '../components/dashboard/scheduleInterview/CompanyInterview'
import ReviewBoard from '../components/dashboard/ReviewBoard'

const AdminDashboard = () => {

  // useEffect(() => {
  //   const fetchIsAdmin = async () => {

  //   }
  //   fetchIsAdmin()
  // },[])

  return (
    <>
      <Sidebar />
      <ReviewBoard />
    </>
  )
}

export default AdminDashboard