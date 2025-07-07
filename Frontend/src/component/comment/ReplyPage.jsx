import React, { useEffect , useRef, useState , useCallback} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import { SendHorizonal , MessageSquare, ChevronLeftIcon, ReplyIcon, XCircleIcon } from 'lucide-react';


import CommentItem from './CommentItem';
import CommentCardSkeleton from '../shared/CommentCardSkeleton';

import lastRefFunc from '../specific/LastRefFunc';
import { useLazyGetACommentQuery, useLazyGetCommentQuery, usePostCommentMutation } from '../../redux/api/api';
import { useSelector } from 'react-redux';


function ReplyPage({comment_id}) {
  const {id} = useParams();
  const {user} = useSelector(state => state.auth) ;
  const observer = useRef() ;
  const navigate = useNavigate() ;

  const [commentInput, setCommentInput] = useState('');
  const [mentions , setMentions] = useState([]) ;

  const [comments, setComments] = useState([]);
  const [mainComment , setMainComment] = useState({});

  const [totalPages , setTotalPages] = useState(1);
  const [page , setPage] = useState(1);

  const [PostCommentMutation] = usePostCommentMutation();

  const[ refetchMainComment , {data , isLoading , isError , error}] = useLazyGetACommentQuery();
  const[fetchReplies , {data : replies , isLoading : isLoadingReplies , isError : isErrorReplies , error : errorReplies}] = useLazyGetCommentQuery();
 
  const handleAddComment = async() => {
    if(!commentInput.trim()) return ;

    try {
      const data = await PostCommentMutation({
        postId : mainComment?.post ,
        content : commentInput ,
        comment_id : mainComment?._id ,

        mentions : mentions ,
        isEdited : false ,
      }).unwrap() ;
      console.log(data);
      
      const author = {
        _id : user?._id ,
        username : user?.username ,
        avatar : {
          url : user?.avatar?.url ,
        } , 
        fullname : user?.fullname ,
      };
      if(data.data){
        setCommentInput('') ;
        setMentions([]) ;
        setComments([{...data.data , author} , ...comments]);
        toast.success('Comment posted successfully!');
      }
      
    } catch (error) {
      console.log('error while posting reply' , error )
      toast.error('Couldn\'t post the comment. Please try again.')
    }
  }

  useEffect(() => {
    if(mainComment && mainComment?._id){
      fetchReplies({
        id : mainComment.post , 
        isComment : 'true' ,
        comment_id : mainComment?._id ,
        page : 1 ,
        limit : 5 ,
      }) ;
    }
  } , [mainComment])

  useEffect(() => {
    setComments([]) ;
    setTotalPages(1) ;
    setPage(1) ;
  } , [id])
  

  useEffect(() => {
    if(page > totalPages) return ;
    if(replies && replies?.data){
      console.log('set replies' , page , totalPages );
      setComments(prev => [...prev , ...replies?.data?.comments]) ;
      setTotalPages(replies?.data?.totalPages) ;
      setPage(prev => prev + 1) ;
    }
  } , [replies])
console.log(replies);

  useEffect(() => {
    if(comment_id || id){
      refetchMainComment({id : comment_id || id}) ;
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
      totalPages : totalPages ,
      fetchFunc : fetchReplies 
    })
  } , [fetchReplies , page , isLoading , totalPages , observer ])

  
  useEffect(() => {
    const detectMentions = () => {
      const matches = commentInput.match(/@[\w]+/g);
      if(mentions.includes('@' + user?.username)) return ; // Prevent adding own username
      if(mentions.includes(matches)) return ; // Prevent duplicates
      if(matches) setMentions(...matches);
      return matches || [] ;
    };

    detectMentions() ;
  } , [commentInput])

  const removeComment = (id) => {
    setComments(prev => prev.filter(c => c._id !== id)) ;
  } ;

  const addToMentions = (username) => {
    if(mentions.includes('@' + username)) return ;
    setMentions([...mentions , '@' + username]) ;
  } ;

  return (
    <div className='dark:text-white h-full text-black   max-h-screen overflow-y-auto ' >
      
      <div className="flex items-center gap-1 bg-gradient-to-r dark:from-black from-white to-transparent   py-2 text-sm font-semibold sticky top-0 z-10"> 
          <button 
          onClick={() => navigate(-1)}
          className='  text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 '>
            <ChevronLeftIcon  /> 
          </button>
          <MessageSquare size={16} />
          {mainComment?.replyCount || ''} Comments
      </div>

      <div className='hover:scale-95 duration-300 transition-all'>
        <CommentItem data={mainComment} showReply={false} removeComment={removeComment} replyButton={addToMentions} />  
      </div>


      {/* Input Section */}
        <div className="flex items-start gap-2 sticky top-7 z-10 p-4 rounded-b-lg shadow-md shadow-black/50 filter backdrop-blur-md ">
          <div className='w-full'>
            <textarea
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500  dark:focus:ring-gray-300 dark:text-white resize-none"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <div className='flex items-center gap-2'>
            {mentions.length > 0 ? <div className='text-xs text-gray-500 mt-2 '>Replying to : {mentions.join(', ')}</div> : null}
            {mentions.length > 0 ? <button className='text-xs text-gray-500 mt-2 rounded-md border-2 border-gray-500 px-1' 
              onClick={() => setMentions([])}
            > Clear </button> : null}
            </div>
          </div>
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            <SendHorizonal size={18} />
          </button>
        </div>

      <div className="w-full h-full max-w-2xl mx-auto p-4 space-y-4 border-t- dark:border-gray-700 border-gray-300 ">
        
      {/* Comments */}
        

        <div className="space-y-4">
        {comments.length > 0 && comments.map((c, i) => {
            return (
              <div ref={i === comments.length - 1 ? lastCommentRef : null} key={c._id}>
                <CommentItem  data={c} removeComment={removeComment} replyButton={addToMentions}/>
              </div>
            );
          })}
                                                                                                            
        </div>
          {isLoading && Array.from({length : 8}).map((_ , i) => (
            <CommentCardSkeleton key={i}/>
          ))}
          {comments.length === 0 && !isLoading && <div className="no-comments h-full text-center text-gray-500">No comments yet</div>}
      </div> 
    </div>

    
  )
}



export default ReplyPage