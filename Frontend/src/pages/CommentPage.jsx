import React from 'react'
import Layout from '../layout/Layout'
import ReplyPage from '../component/comment/ReplyPage'
import { ChevronLeft } from 'lucide-react'

function CommentPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-white w-full min-h-screen relative'>
        <button 
        onClick={() => window.history.back()}
        className='absolute top-2 left-2  text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 '>
          <ChevronLeft  /> 
        </button>
        <ReplyPage />
      </div>
    </Layout>
  )
}

export default CommentPage