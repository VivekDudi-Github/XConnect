import React from 'react'
import Layout from '../layout/Layout'
import MainPost from '../component/post/MainPost'
import CommentSection from '../component/comment/commentSection'
import { useLocation } from 'react-router-dom'
import ReplyPage from '../component/comment/ReplyPage'

function PostPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search) ;
  const comment_Id = query.get('comment_Id');


  return (
    <Layout>
      <div className='dark:bg-black bg-white dark:text-white min-h-screen '>  
        <MainPost/>
        {!comment_Id ? 
        <CommentSection /> : <ReplyPage comment_id={comment_Id}/>  
        }
      </div>
    </Layout>
  )
}

export default PostPage