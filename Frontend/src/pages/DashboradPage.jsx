import React from 'react'
import Layout from '../layout/Layout'
import { Outlet } from 'react-router-dom'

function DashboradPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-transparent sm:pb-0 pb-8 w-full min-h-screen overflow-hidden relative'>
        <Outlet />
      </div>
    </Layout>
  )
}

export default DashboradPage