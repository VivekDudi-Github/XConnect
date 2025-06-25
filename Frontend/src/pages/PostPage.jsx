import React from 'react'
import Layout from '../layout/Layout'
import MainPost from '../component/post/MainPost'
import CommentSection from '../component/comment/commentSection'

function PostPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-white dark:text-white'>
        <MainPost/>
        <CommentSection/>
      </div>
    </Layout>
  )
}

export default PostPage