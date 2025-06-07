import React from 'react'
import Layout from '../layout/Layout'
import Feed from '../component/explore/Feed'

function HomePage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-white dark:text-white'>
        <Feed/>
      </div>
    </Layout>
  )
}

export default HomePage