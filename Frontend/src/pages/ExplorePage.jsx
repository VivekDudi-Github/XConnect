import React from 'react'
import Layout from '../layout/Layout'
import Explore from '../component/explore/Explore'

function ExplorePage() {
  return (
    <Layout>
      <div className='w-full dark:bg-black bg-white dark:text-white h-screen '>
        <Explore/>
      </div>
    </Layout>
  )
}

export default ExplorePage