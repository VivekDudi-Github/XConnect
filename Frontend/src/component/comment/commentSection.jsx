import React, {useRef , useEffect, useState , useCallback, act} from 'react';
import {
  MessageSquare,
  Heart,
  ChevronDown,
  SendHorizonal,
  ThumbsUp,
  Trash2Icon
} from 'lucide-react';
import {toast} from 'react-toastify';

import CommentItem from './CommentItem';
import CommentCardSkeleton from '../shared/CommentCardSkeleton';
import { useDeleteCommentMutation, useLazyGetCommentQuery, usePostCommentMutation } from '../../redux/api/api';
import { useParams } from 'react-router-dom';
import lastRefFunc from '../specific/LastRefFunc';
import { useSelector } from 'react-redux';
import { set } from 'mongoose';

export default function CommentSection() {
  const {id} = useParams();
  const observer = useRef();

  const {user} = useSelector(state => state.auth);

  const [totalComments , setTotalComments] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isOpenOptions , setIsOpenOptions] = useState(false) ;
  const [sortBy, setSortBy] = useState('top');

  const [totalPages , setTotalPages] = useState(0);
  const [page , setPage] = useState(1);
  

  const [PostCommentMutation] = usePostCommentMutation();
  const [getCommentQuery , {data , isLoading , isError , error}] = useLazyGetCommentQuery({id : id}) ;


  const handleAddComment = async() => {
    try {
      const {data} = await PostCommentMutation({
        postId : id ,
        content : commentInput ,
        isEdited : false ,
        mentions : [] ,
      }).unwrap();
      const author = {
        _id : user?._id ,
        username : user?.username ,
        avatar : {
          url : user?.avatar?.url ,
        } , 
      };

      setComments([{...data , author} , ...comments]);
      setCommentInput('');

    } catch (error) {
      console.log('error in posting comment' , error);
      toast.error(error?.data?.message || "Couldn't post the comment. Please try again.");
    }
  };
  
  const lastCommentRef = useCallback(node => {
    lastRefFunc({
      observer , 
      id ,
      node , 
      isLoading , 
      page ,
      activeTab : null ,
      sortBy ,
      toatalPages : totalPages ,
      fetchFunc : getCommentQuery 
    })
  } , [getCommentQuery , page , isLoading , totalPages  , sortBy , observer ])
  

useEffect(() => {getCommentQuery({id , page })} , [] ) ;

useEffect(() => {
  if( sortBy !== 'top'){
    setComments([]) ;
    setPage(1) ;
    getCommentQuery({id , page : 1 , sortBy}) ;  
  }
} , [sortBy]) ;

console.log(page , totalPages);


useEffect(() => {
  if(data && data?.data){
    setComments([...data?.data?.comments , ...comments]) ;
    setTotalComments(data?.data?.totalComments) ;
    setTotalPages(data?.data?.totalPages) ;
    setPage(prev => prev + 1) ;
  }
} , [data]) ;

useEffect(() => {
  if(isError){
    toast.error(error?.data?.message || "Couldn't fetch the comments. Please try again.");
    console.log( error ) ;
  }
} , [error , isError])


const removeComment = (id) => {
  setComments(prev => prev.filter(c => c._id !== id)) ;
  setTotalComments(prev => prev - 1) ;
}

  const handleLike = (id) => {};



  return (
    <div className="w-full h-full max-w-2xl mx-auto p-4 space-y-4 border-t- dark:border-gray-700 border-gray-300 ">
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

      {/* Sorting */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1 ">
          <MessageSquare size={16} />
          {totalComments || ''} Comments
        </div>
        <div className="flex items-center gap-1 relative z-20"
        onClick={()=> setIsOpenOptions(prev => !prev)}
        >
          Sort by:{" "}
          <button 
           
          className="flex items-center gap-1 dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-2 duration-200 ">
            {sortBy}
            <ChevronDown size={14} />
          </button>
          <div className={`absolute w-28 top-6 dark:text-slate-400 right-8 duration-200 bg-white dark:bg-slate-800 shadow-md shadow-black/60 rounded-lg  ${isOpenOptions ? '' : 'scale-0 translate-x-14 -translate-y-14 ' }  `}>
            <div
             onClick={() => setSortBy('Top') }
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
              Top
            </div>
            <div
             onClick={() => setSortBy('Most Liked') }
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
              Most Liked
            </div>
            <div
            onClick={() => setSortBy('Newest ') }
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
              Newest
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
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

  );
}

