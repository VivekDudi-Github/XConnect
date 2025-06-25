import React, { use, useState } from 'react';
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
import { usePostCommentMutation } from '../../redux/api/api';
import { useParams } from 'react-router-dom';


export default function CommentSection() {
  const {id} = useParams();
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isOpenOptions , setIsOpenOptions] = useState(false) ;
  const [sortBy, setSortBy] = useState('Top');

  const [PostCommentMutation] = usePostCommentMutation();

  const handleAddComment = async() => {
    

    try {
      console.log('run 1');
      
      const {data} = await PostCommentMutation({
        postId : id ,
        content : commentInput ,
        isEdited : false ,
        mentions : [] ,
      }).unwrap();
      console.log('completed' , data);
      
      setComments([data, ...comments]);
      setCommentInput('');

    } catch (error) {
      console.log('error in posting comment' , error);
      toast.error(error?.data?.message || "Couldn't post the comment. Please try again.");
    }
  };

  const handleLike = (id, isReply = false, parentId = null) => {};




  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4 border-t- dark:border-gray-700 border-gray-300">
      {/* Input Section */}
      <div className="flex items-start gap-2">
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
          {comments.length} Comments
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
        {comments && comments.map((comment) => (
          <CommentItem key={comment._id} data={comment} onLike={handleLike} />
        ))}
      </div>
        {!comments && Array.from({length : 4}).map((_ , i) => (
          <CommentCardSkeleton key={i}/>
        ))}
    </div>

  );
}

