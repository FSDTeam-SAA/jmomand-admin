import React from 'react'
import DashboardStats from './_components/DashboardStats'
import RevenueChart from './_components/revenue-chart'
import QuickActions from './_components/QuickActions'

const page = () => {
  return (
    <div className='space-y-10'>
      <DashboardStats/>
      <RevenueChart/>
      <QuickActions/>
    </div>
  )
}

export default page