import React from 'react'
import ProfileHeader from '../component/profile/ProfileHeader'
import ProfileTabs from '../component/profile/ProfileTabs'
import Layout from '../layout/Layout'

function Profile() {
  return (
    <Layout>
      <div className='dark:bg-black bg-white w-full h-full'>
        <div className="max-w-4xl  mx-auto ">
            <ProfileHeader />
            <ProfileTabs />
        </div>
    </div>
    </Layout>
  )
}

export default Profile