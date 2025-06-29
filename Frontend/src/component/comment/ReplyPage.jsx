import React, { useEffect , useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetACommentQuery, usePostCommentMutation } from '../../redux/api/api';
import { toast } from 'react-toastify';
import { SendHorizonal } from 'lucide-react';
import CommentCardSkeleton from '../shared/CommentCardSkeleton';


function ReplyPage() {
  const {id} = useParams();

  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([]);

  const [PostCommentMutation] = usePostCommentMutation();

  const {data , isLoading , isError , error} = useGetACommentQuery({id});

  const handleAddComment = async() => {}


  useEffect(() => {
    if(isError){
      console.log(error);
      toast.error(error?.data?.message || "Couldn't fetch the comment. Please try again.");
    }
  } , [error , isError])

  useEffect(() => {
    if(data){
      console.log(data);
    }
  } , [data])


  return (
    <div className='dark:text-white text-black relative pt-7 overflow-auto' >
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
    </div>
  )
}

export default ReplyPage