import React, { lazy, useRef } from 'react'
import {useSelector} from 'react-redux'

import ProfileHeader from '../component/profile/ProfileHeader'
import ProfileTabs from '../component/profile/ProfileTabs'
import Layout from '../layout/Layout'


const EditProfile = lazy(() =>  import('../component/profile/EditProfile'))

function Profile() {
  const isProfileEdit = useSelector((state) => state.misc.isProfileEdit);
  const containerRef = useRef(null);

  return (
    <Layout>
      <div className='dark:bg-black bg-white w-full h-full'>
          <div className={`w-full h-screen relative ${isProfileEdit ? 'overflow-hidden' : ''}`}>
              <ProfileHeader />
              <ProfileTabs containerRef={containerRef} />
              {isProfileEdit && (
                <div className='absolute top-0 flex justify-center w-full backdrop-filter h-full backdrop-blur-sm '>
                  <EditProfile/>
                </div>
              )}
          </div>
      </div> 
    
    </Layout>
  )
}

export default Profile