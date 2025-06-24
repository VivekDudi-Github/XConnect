import React, { useState } from 'react';
import {
  MessageSquare,
  Heart,
  ChevronDown,
  SendHorizonal,
  ThumbsUp,
  Trash2Icon
} from 'lucide-react';

import CommentItem from './CommentItem';
import CommentCardSkeleton from '../shared/CommentCardSkeleton';

const mockComments = [
  {
    id: 1,
    user: 'Alex',
    text: 'Great post!',
    likes: 12,
    replies: [],
  },
  {
    id: 2,
    user: 'Sam',
    text: 'Interesting insights. @alex',
    likes: 8,
    replies: [],
  },
];

export default function CommentSection() {
  const [comments, setComments] = useState(mockComments);
  const [commentInput, setCommentInput] = useState('');
  const [isOpenOptions , setIsOpenOptions] = useState(true) ;
  const [sortBy, setSortBy] = useState('Top');

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: Date.now(),
      user: 'You',
      text: commentInput,
      likes: 0,
      replies: [],
    };
    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  const handleLike = (id, isReply = false, parentId = null) => {};

  const sortedComments =
    sortBy === 'Top'
      ? [...comments].sort((a, b) => b.likes - a.likes)
      : comments;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Input Section */}
      <div className="flex items-start gap-2">
        <textarea
          className="w-full p-2 border rounded-lg resize-none text-sm "
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
        <div className="flex items-center gap-1 relative z-50"
        onClick={()=> setIsOpenOptions(prev => !prev)}
        >
          Sort by:{" "}
          <button className="flex items-center gap-1 dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-2 duration-200 ">
            {sortBy}
            <ChevronDown size={14} />
          </button>
          <div className={`absolute w-28 top-6 dark:text-slate-400 right-8 duration-200 bg-white dark:bg-slate-800 shadow-md shadow-black/60 rounded-lg  ${isOpenOptions ? '' : 'scale-0 translate-x-14 -translate-y-14 ' }  `}>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
              <span>Top</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
              <span>Newest</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
              <span>Most Likes</span>
            </div>
          </div>
        </div>
        

      </div>

      {/* Comments */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <CommentItem key={comment.id} data={comment} onLike={handleLike} />
        ))}
      </div>
      <CommentCardSkeleton/>
    </div>

  );
}

