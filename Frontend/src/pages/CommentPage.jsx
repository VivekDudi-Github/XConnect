import React from 'react'
import Layout from '../layout/Layout'
import ReplyPage from '../component/comment/ReplyPage'
import { ChevronLeft } from 'lucide-react'

function CommentPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-transparent  w-full min-h-screen overflow-hidden relative'>
        <ReplyPage />
      </div>
    </Layout>
  )
}

export default CommentPage