import React from 'react'
import Layout from '../layout/Layout'
import Feed from '../component/explore/Feed'
import CreatePost from '../component/post/CreatePost'

function HomePage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-white dark:text-white'>
        <CreatePost/>
        <Feed/>
      </div>
    </Layout>
  )
}

export default HomePage