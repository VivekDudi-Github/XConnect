import React from 'react'
import Layout from '../layout/Layout'
import ReplyPage from '../component/comment/ReplyPage'
import { ChevronLeft } from 'lucide-react'

function CommentPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-white w-full min-h-screen relative'>
        <ReplyPage />
      </div>
    </Layout>
  )
}

export default CommentPage