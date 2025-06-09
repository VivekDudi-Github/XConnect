import React, { lazy } from 'react'
import {useSelector} from 'react-redux'

import ProfileHeader from '../component/profile/ProfileHeader'
import ProfileTabs from '../component/profile/ProfileTabs'
import Layout from '../layout/Layout'


const EditProfile = lazy(() =>  import('../component/profile/EditProfile'))

function Profile() {
  const isProfileEdit = useSelector((state) => state.misc.isProfileEdit);

  console.log('isProfileEdit', isProfileEdit);
  
  return (
    <Layout>
      <div className='dark:bg-black bg-white w-full h-full'>
          <div className="w-full relative">
              <ProfileHeader />
              <ProfileTabs />
              {isProfileEdit && (
                <div className='absolute top-0 flex items-center w-full backdrop-filter backdrop-blur-sm '>
                  <EditProfile/>
                </div>
              )}
          </div>
      </div> 
    
    </Layout>
  )
}

export default Profile