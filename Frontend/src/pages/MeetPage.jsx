import React from 'react'
import Layout from '../layout/Layout'
import MeetLayout from '../component/Call/MeetLayout'

function MeetPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-transparent  w-full min-h-screen overflow-hidden relative'>
        <MeetLayout />
      </div>
    </Layout>
  )
}

export default MeetPage