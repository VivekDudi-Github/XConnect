import { ChevronDown, ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, InfoIcon, Loader2Icon, LoaderPinwheelIcon, MessageSquareIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDeleteCommentMutation, useLazyGetCommentQuery, usePostCommentMutation, useToggleDisLikeCommentMutation, useToggleLikeCommentMutation } from "../../redux/api/api";
import moment from "moment";
import RenderPostContent from "../specific/RenderPostContent";
import { toast } from "react-toastify";
import TextArea from 'react-textarea-autosize'



function Comment({ comment,  id , nestedNo , closePreThreadFunc }) {
  const {user} = useSelector(state => state.auth) ;
  console.log(comment?.content);
  const renderPreRef = useRef(null) ;
  const [ContinueThread , setContinueThread] = useState(false) ;

  const [isDeleted , setIsDeleted] = useState(comment?.isDeleted) ;
  const [expandable , setExpandable] = useState(false) ;
  const [textExpended , setTextExpended] = useState(false) ;
  const [commentLoader ,  setCommentLoader] = useState(false) ;

  const [showReply, setShowReply] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [likeCount , setLikeCount] = useState(comment?.likeCount || 0) ;
  const [dislikeCount , setDislikeCount] = useState(comment?.dislikeCount || 0) ;

  const [isOpenOptions , setOpenOptions] = useState(false) ;
  const [likeStatus , setLikeStatus] = useState(comment.likeStatus) ;
  const [dislikeStatus , setDislikeStatus] = useState(comment?.dislikeStatus) ;

  const [toggleLikeMutation , {isLoading : likeLoading}] = useToggleLikeCommentMutation();
  const [toggleDislikeMutation , {isLoading : dislikeLoading}] = useToggleDisLikeCommentMutation();
  const [PostReplyMutation] = usePostCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();

  const [replyCount , setReplyCount] = useState(comment?.replyCount) ;
  const [replies , setReplies] = useState([]) ;
  const [page , setPage] = useState(1) ;

  const [fetchMoreComments , {data , isLoading , isFetching  ,error,  isError }] = useLazyGetCommentQuery() ;
  

  const deleteCommentFunc = async() => {
      try {
        await deleteCommentMutation({id : comment._id}).unwrap() ; 
        setIsDeleted(true) ;
        toast.success('Comment deleted successfully!')
      } catch (error) {
        console.log('error in deleting comment' , error);
        toast.error(error?.data?.message || "Couldn't delete the comment. Please try again.");
      }
    }


  const toggleLiketFunc = async() => {
    try {
      const res = await toggleLikeMutation({id : comment._id})
      console.log(res);
      
      if(res.data.data.operation){
        setLikeStatus(true)
        setLikeCount(likeCount + 1)
        if(dislikeStatus === true) setDislikeCount(prev => prev - 1)
        setDislikeStatus(false)
      }else {
        setLikeCount(likeCount - 1)
        setLikeStatus(false)
      }
    } catch (error) {
      console.log('error in toggling like' , error);
    }
  }
  const toggleDisLiketFunc = async() => {
    try {
      const res = await toggleDislikeMutation({id : comment._id})
      if(res.data.data.operation){
        if(likeStatus === true) setLikeCount(prev => prev - 1)
        setLikeStatus(false) ;
        setDislikeStatus(true) ;
        setDislikeCount(dislikeCount + 1)
      }else {
        setDislikeCount(dislikeCount - 1)
        setLikeStatus(false) ;
        setDislikeStatus(false) ;
      }
    } catch (error) {
      console.log('error in toggling like' , error);
    }
  }
  const fetchMoreCommentsFunc = async() => {
    try {
      fetchMoreComments({page ,id , limit : 2 , sortBy : 'Newest' ,  isComment : true , comment_id : comment._id})
    } catch (error) {
      console.log('error in fetching more comments' , error);
    }
  }

  const handleReply = async(e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setCommentLoader(true) ;

    try {
      const res = await PostReplyMutation({postId : id ,  comment_id : comment._id  , content : replyText , isEdited : false , mentions : []}).unwrap() ;
      console.log(res);
      
      setReplyText('');
      setShowReplyBox(false);
      setReplyCount(prev => prev + 1) ;
      setReplies(prev => [...prev , 
        {...res.data ,
          author : {
            username : user?.username ,
            avatar : {
              url : user?.avatar?.url ,
            } ,
          }
         }
      ]);
    } catch (error) {
      console.log('error in posting reply' , error);
      toast.error(error?.data?.message || "Couldn't post the reply. Please try again.");
    } finally{
      setCommentLoader(false);
    }
  };

  useEffect(() => {
    if(data && data.data){
      setReplies((prev) => {
        if (prev.length &&
          prev.at(-1)?._id === data.data.comments.at(-1)?._id
        ) {
          return prev ;
        }
        return [...prev, ...data.data.comments]}) ;
      setPage(prev => prev + 1) ;
    }

  } , [data])

  useEffect(() => {
    if( page === 1 && showReply){
      fetchMoreComments({page ,id , limit : 2 ,sortBy : 'Newest' ,  isComment : true , comment_id : comment._id})
    }
  } , [showReply])

  useEffect(() => {
    const timer =setTimeout(() => {
      if(renderPreRef.current){
      if(renderPreRef.current.scrollHeight > 50 ){
        setExpandable(true)
      }
    }
    } , 50)

    return () => clearTimeout(timer) ;
  } , []);

  useEffect(() => {
    if(isError){
      toast.error(error?.data?.message || "Couldn't fetch the post. Please try again.");
    }
  } , [isError])

  const closeAllThreadFunc = ()=> {
    if(typeof closePreThreadFunc === 'function') closePreThreadFunc()
    setContinueThread(false)
  }

  return (
    <div className="mb-4 ">
      <div className="dark:bg-[#000]  text-black dark:text-white border-t-2 border-gray-700 p-2 rounded-lg">
        
        {/* Header and Options */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={comment?.author?.avatar?.url} alt="" className="w-8 h-8 rounded-full"/> 
            <Link to={'/profile/'+comment.user} className="text-sm text-slate-400">
              <span className="dark:text-cyan-600">{comment.author.username}</span> • {moment(comment.createdAt).fromNow()}
            </Link>
          </div>

          {/* options */}
          <button onClick={() => setOpenOptions(prev => !prev)}
            className='relative dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-2 duration-200'
            >
            <EllipsisVerticalIcon size={17} />
            <div className={`absolute min-w-40 top-2 right-6 duration-200 bg-white dark:bg-slate-800 shadow-md shadow-black/60 rounded-lg ${isOpenOptions ? 'block' : 'scale-0 translate-x-14 -translate-y-2 ' }  `}> 
              <div 
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer"
              >
                  <InfoIcon size={17} className="fill-red-500 text-white" />
                  <span>Report</span>
              </div>
              <div onClick={deleteCommentFunc}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer"
              >
                  <Trash2Icon size={17} className="fill-red-500 text-white" />
                  <span>Delete </span>
              </div> 
            </div>
          </button>
        </div>

        {/* content */}
        <div className={` ${textExpended ? 'overflow-auto' : 'overflow-hidden'}  transition-[max-height] duration-500 ease-in-out  `}
          style={{
            maxHeight : textExpended ? '800px' : '48px' ,
          }}
          >
          {isDeleted ? (
            <pre ref={renderPreRef} className="dark:text-gray-300 text-sm mb-0.5 font-sans italic text-wrap">
              Comment was deleted.
            </pre>
            ) : (
            <pre ref={renderPreRef} className="dark:text-gray-300 text-sm mb-0.5 font-sans text-wrap">
              <RenderPostContent text={comment?.content}/>
            </pre>
          )}
        </div>
        <button 
          onClick={() => setTextExpended((prev) => !prev)}
          className={`text-gray-500 mb-1 text-sm font-sans text-wrap block ${expandable ? '' : 'hidden'}`}>
              {textExpended ? 'show less..' : 'read more...'}
        </button>

        {/* Actions  */}
        <div className="mt-2 text-sm text-gray-500 flex gap-4 items-center">
          { replyCount > 0 && 
          <button  
            onClick={() => setShowReply(!showReply)}
            className={`flex justify-between items-center gap-1 dark:hover:text-white `}>
              {replyCount || 0 } Replies  
              {isLoading ? (
                <Loader2Icon className="animate-spin" size={15} />
              ) : (
                <ChevronDown className={` ${!showReply ? '' : ' rotate-180'} duration-200`} size={15}/>
              )}
          </button>
          }
          <button 
          disabled={isDeleted || likeLoading} 
          onClick={toggleLiketFunc} 
          className="flex items-center dark:hover:text-white gap-1 disabled:opacity-50"> 
            <ThumbsUpIcon className={`${likeStatus ? 'dark:fill-gray-300 dark:text-gray-300 fill-cyan-500 text-cyan-500' : ''}  hover:text-gray-600 dark:hover:text-white active:scale-75 duration-200`} size={17} /> 
            {' '} {likeLoading ? <LoaderPinwheelIcon className="animate-spin duration-200 p-1" /> : likeCount}
          </button> 
          <button 
          disabled={isDeleted || dislikeLoading} 
          onClick={toggleDisLiketFunc} 
          className="flex items-center dark:hover:text-white gap-1 disabled:opacity-50"> 
            <ThumbsDownIcon className={`${dislikeStatus ? 'dark:fill-gray-300 dark:text-gray-300 fill-cyan-500 text-cyan-500' : ''} active:scale-75  hover:text-gray-600 dark:hover:text-white duration-200`} size={17} /> 
            {' '} {dislikeLoading ? <LoaderPinwheelIcon className="animate-spin duration-200 p-1" /> : dislikeCount} 
          </button> 
          <button className="flex items-center gap-1 dark:hover:text-white" onClick={() => setShowReplyBox(!showReplyBox)}><MessageSquareIcon size={15} /> 
            Add Reply
          </button>
          
        </div>
      </div>

      {/* Reply Box */}
      {showReplyBox && (
        <div className="ml-6 mt-2">
          <TextArea maxRows={8}
            rows="2"
            placeholder="Write a reply..."
            className="w-full p-1 py-1 focus:pl-3 rounded-sm text-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadowLight"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="flex gap-2 font-semibold mt-2">
            <button
              onClick={handleReply}
              className="bg-cyan-600 text-black hover:text-white hover:bg-cyan-500 px-4 py-1 rounded text-sm shadowLight" 
            >
              {commentLoader ? <Loader2Icon className='animate-spin'/> : 'Reply'}
            </button>
            <button
              onClick={() => setShowReplyBox(false)}
              className="bg-gray-700 hover:text-white hover:bg-gray-500 px-4 py-1 rounded text-sm shadowLight"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Child Replies */}
      {showReply && replyCount > 0 && (
        <div className="ml-6 mt-3 border-l border-gray-700 pl-4">
          {replies.map((reply) => (
            <Comment key={reply._id} nestedNo={nestedNo+1} comment={reply} id={id}  />
          ))}

          {replyCount > replies.length && nestedNo < 4  && (
            <button
            onClick={fetchMoreCommentsFunc}
            className="text-sm text-cyan-600 px-1 font-semibold  flex items-center gap-2 mt-4  rounded-full"
            >
              View More Replies {isFetching ? <Loader2Icon size={15} className='animate-spin' /> : <ChevronDown size={15} /> } 
            </button>
          )}
          {nestedNo >= 4 && (
            <button
            onClick={() => setContinueThread(true)}
            className="text-sm text-cyan-600 px-1 font-semibold  flex items-center gap-1 mt-4  rounded-full">
              Continue this thread<ChevronRightIcon size={15} />   
            </button>
          )}
        </div>
      )}

      {ContinueThread && <div className="fixed p-4 mx-auto inset-x-10 rounded-lg border inset-y-10  z-50 overflow-auto bg-white dark:bg-black h-[100% - 50px] max-w-6xl shadowLight " >
        <div className="flex items-center justify-between text-sm text-gray-500  mb-1">
          <button title="Moves to previous thread" className=" flex gap-1 text-gray-400"
            onClick={() => {setContinueThread(false)}}
          > 
            <ChevronLeftIcon className="dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-0.5 duration-200" /> 
            Back
          </button>
          <button title='Close all the threads' className=' p-1 text-gray-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black duration-300 active:scale-90'
            onClick={closeAllThreadFunc}
          >
            <XIcon />
          </button>
        </div>
        <CommentsThread commentsArr={[comment]} id={id} closePreThreadFunc={closeAllThreadFunc}/>
      </div>}

    </div>
  );
}

function CommentsThread({commentsArr = [] , id , closePreThreadFunc = () => {} }) {

  return (
    <div className="w-full mx-auto text-white rounded-xl border custom-box pb-0.5 ">

      {commentsArr.map((comment) => (
        <Comment key={comment._id} id={id} nestedNo={1} closePreThreadFunc={closePreThreadFunc} comment={comment} />
      ))}
    </div>
  );
}

export {
  Comment , 
  CommentsThread ,
}
