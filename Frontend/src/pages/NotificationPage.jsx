import React from 'react'
import Layout from '../layout/Layout'
import Notification from '../component/notification/Notification'

function NotificationPage() {
  return (
    <Layout>
    <div className='dark:bg-black bg-white dark:text-white min-h-screen'>
    <Notification />
    </div>
  </Layout>
  )
}

export default NotificationPage