import { useState , useRef , useEffect  } from "react";
import {
  ChevronDown,
  Heart,
  ReplyIcon,
  Share2Icon,
  Trash2Icon,
} from 'lucide-react';
import RenderPostContent from "../specific/RenderPostContent";
import moment from "moment";
import { useDeleteCommentMutation, useToggleLikeCommentMutation } from "../../redux/api/api";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";



export default function CommentItem({ data , removeComment , showReply = true , replyButton}) {
  const [replyInput, setReplyInput] = useState('');

  const renderPreRef = useRef(null) ;
  const [expandable , setExpandable] = useState(false) ;
  const [textExpended , setTextExpended] = useState(false) ;

  const [likeStatus, setLikeStatus] = useState(data?.likeStatus);
  const [totalLikes, setTotalLikes] = useState(data?.likeCount);

  const [LikeMutation , {LikeMutationIsLoading}] = useToggleLikeCommentMutation() ;
  const [DeleteMutation] = useDeleteCommentMutation() ;

  const handleReply = () => {
    if (!replyInput.trim()) return;
    data.replies.push({
      id: Date.now(),
      user: 'You',
      text: replyInput,
      likes: 0,
      replies: [],
    });
    setReplyInput('');
  };

  const handleLike = async() => {
  try {
    const res = await LikeMutation({id : data._id}).unwrap() ;
    if(res.data.operation){
      setLikeStatus(true) ;
      setTotalLikes(prev => prev + 1)
    }else {
      setLikeStatus(false) ;
      setTotalLikes(prev => prev - 1)
    }
  } catch (error) {
   console.log( 'error in liking comment' , error); 
    }
  };

  const handleDeleteComment = async() => {
    console.log('deleting comment');
    try {
      const res = await DeleteMutation({id : data._id}).unwrap() ;
      if(res.success){
        toast.success('Comment deleted successfully!') ;
        removeComment(data._id) ;
      }
    } catch (error) {
      toast.error(error?.data?.message || "Couldn't delete the comment. Please try again.");
    }
    
  }

  useEffect(() => {
    if(renderPreRef.current){
      if(renderPreRef.current.scrollHeight > 50 ){
        setExpandable(true)
      }
    }
  } , [data.content])


  return (
    <div className="p-3 rounded-lg dark:bg-black gradient-to-t dark:from-slate-900 dark:to-black dark:text-white shadow-slate-800/50 shadow-lg dark:border-x dark:border-white border-slate-800/50 duration-200 hover:scale-105">
      <div className="flex justify-between items-center pb-2">
        <div className="flex gap-2 items-center">
          <img className="size-7 rounded-full" src={data?.author?.avatar?.url || '/avatar-default.svg'} alt="" />
          <div className="text-sm font-medium">{data?.author?.fullname }</div>
          <div className="text-xs font-medium text-blue-600">@{data?.author?.username }</div>
        </div>
        
        {/* Likes and Shares */}
        <div className="flex gap-2">
        <button
          disabled = {LikeMutationIsLoading}
          onClick={handleLike}
          className="flex items-center gap-1 text-xs"
        >
          <Heart size={14} className={`${likeStatus ? 'fill-fuchsia-400' : ''} duration-200 hover:scale-110 active:scale-95 text-fuchsia-400`} />
          {totalLikes || ''}
        </button>
        {typeof replyButton === 'function' && (
          <button
          onClick={() => replyButton(data?.author?.username)}
            className="flex items-center gap-1 text-xs text-green-500  "
          >
            <ReplyIcon size={18} className="fill-green-500"/>
          </button>
        )}
        <button
          className="flex items-center gap-1 text-xs text-blue-500  "
        >
          <Share2Icon size={14} className="fill-blue-500"/>
        </button>
        <button
        onClick={() => handleDeleteComment()}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-500"
        >
          <Trash2Icon size={14} />
        </button>
        </div>
      </div>
      
      {/* Comment Content */}
      <div className={` overflow-hidden transition-[max-height] duration-1000 ease-in-out `}
      style={{
        maxHeight : textExpended ? '800px' : '48px' ,
      }}
      >
        <pre ref={renderPreRef} className="dark:text-gray-300 text-sm mb-0.5 font-sans text-wrap"><RenderPostContent text={data?.content}/></pre>
      </div>
      <button 
      onClick={() => setTextExpended((prev) => !prev)}
      className={`text-gray-500 mb-1 text-sm font-sans text-wrap ${expandable ? '' : 'hidden'}`}>
            {textExpended ? 'show less..' : 'read more...'}
      </button>

      {/* last row */}
      <NavLink to={'/comment/'+ data._id} className="mt-2 flex justify-between gap-3 text-xs text-gray-500">
        <button  className={`flex ${showReply ? '' : 'hidden'}`}>
          {data?.replyCount } Replies <ChevronDown size={15}/> 
        </button>
        <span className="text-gray-500 text-xs">{moment(data?.createdAt).fromNow()}.</span>
      </NavLink>


    </div>
  );
}