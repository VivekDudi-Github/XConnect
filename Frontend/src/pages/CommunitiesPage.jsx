import React from 'react'
import Layout from '../layout/Layout'
import CommunityHome from '../component/community/communityHome'

function CommunitiesPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-transparent  w-full min-h-screen overflow-hidden relative'>
        <CommunityHome/>
      </div>
    </Layout>
  )
}

export default CommunitiesPage