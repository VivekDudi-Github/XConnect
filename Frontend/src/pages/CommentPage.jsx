import React from 'react'
import Layout from '../layout/Layout'
import CommentSection from '../component/comment/commentSection'

function CommentPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-white dark:text-white'>
        <CommentSection />
      </div>
    </Layout>
  )
}

export default CommentPage