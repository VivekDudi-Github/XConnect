import React, { useEffect , useRef, useState , useCallback} from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import { SendHorizonal , MessageSquare, ChevronLeftIcon } from 'lucide-react';


import CommentItem from './CommentItem';
import CommentCardSkeleton from '../shared/CommentCardSkeleton';

import lastRefFunc from '../specific/LastRefFunc';
import { useLazyGetACommentQuery, useLazyGetCommentQuery, usePostCommentMutation } from '../../redux/api/api';


function ReplyPage() {
  const {id} = useParams();
  const observer = useRef() ;

  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);
  const [mainComment , setMainComment] = useState({});

  const [totalPages , setTotalPages] = useState(0);
  const [page , setPage] = useState(1);

  const [PostCommentMutation] = usePostCommentMutation();

  const[ refetchMainComment , {data , isLoading , isError , error}] = useLazyGetACommentQuery();
  const[fetchReplies , {data : replies , isLoading : isLoadingReplies , isError : isErrorReplies , error : errorReplies}] = useLazyGetCommentQuery();
 console.log(comments);
 
  const handleAddComment = async() => {}

  useEffect(() => {
    if(mainComment && mainComment?._id){
      fetchReplies({
        id , 
        isComment : true ,
        comment_id : mainComment?._id ,
        page : 1 ,
        limit : 5 ,
      }) ;
    }
  } , [mainComment])

  useEffect(() => {
    if(replies && replies?.data){
      setComments(prev => [...prev , ...replies?.data?.comments]) ;
      setTotalPages(replies?.data?.totalPages) ;
      setPage(prev => prev + 1) ;
    }
  } , [replies])

  useEffect(() => {
    if(id){
      refetchMainComment({id}) ;
    }
  } , [id]) ;

  useEffect(() => {
    if(isError){
      console.log(error);
      toast.error(error?.data?.message || "Couldn't fetch the comment. Please try again.");
    }
    if(isErrorReplies){
      console.log(errorReplies);
      toast.error(errorReplies?.data?.message || "Couldn't fetch the comment. Please try again.");
    }
  } , [error , isError , isErrorReplies , errorReplies])

  useEffect(() => {
    if(data && data?.data){
      setMainComment(data?.data);
    }
  } , [data])

  const lastCommentRef = useCallback(node => {
    lastRefFunc({
      observer , 
      id ,
      node , 
      isLoadingReplies , 
      page ,
      activeTab : null ,
      sortBy : '' ,
      toatalPages : totalPages ,
      fetchFunc : fetchReplies 
    })
  } , [fetchReplies , page , isLoading , totalPages , observer ])


  const removeComment = (id) => {} ;

  return (
    <div className='dark:text-white text-black relative pt- overflow-auto pt-2' >
      
      <div className="flex items-center gap-1  mb-2 text-sm font-semibold">
          <button 
          onClick={() => window.history.back()}
          className='  text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 '>
            <ChevronLeftIcon  /> 
          </button>
          <MessageSquare size={16} />
          {mainComment?.replyCount || ''} Comments
      </div>

      <div className='hover:scale-95 duration-300 transition-all'>
        <CommentItem data={mainComment} showReply={false} removeComment={removeComment} />  
      </div>

      <div className="w-full h-full max-w-2xl mx-auto p-4 space-y-4 border-t- dark:border-gray-700 border-gray-300 ">
        
        {/* Comments */}

{/* Input Section */}
        <div 
        style={ {
          position : 'sticky' ,
          top : '0' ,
          zIndex : '10' ,
        }}
        className="flex items-start gap-2">
          <textarea
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500  dark:focus:ring-gray-300 dark:text-white resize-none"
            placeholder="Write a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            <SendHorizonal size={18} />
          </button>
        </div>

        <div className="space-y-4">
        {comments.length > 0 && comments.map((c, i) => {
            return (
              <div ref={i === comments.length - 1 ? lastCommentRef : null} key={c._id}>
                <CommentItem data={c} removeComment={removeComment} />
              </div>
            );
          })}
                                                                                                            
        </div>
          {isLoading && Array.from({length : 4}).map((_ , i) => (
            <CommentCardSkeleton key={i}/>
          ))}
          {comments.length === 0 && !isLoading && <div className="no-comments h-full text-center text-gray-500">No comments yet</div>}
      </div> 
    </div>
  )
}



export default ReplyPage