import { BarChart2Icon, BookmarkIcon, ChevronDown, ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, FlagIcon, HeartIcon, InfoIcon, Loader2Icon, MessageSquareIcon, Pin, PinIcon, Repeat2Icon, Share2Icon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDeleteCommentMutation, useGetPostQuery, useLazyGetCommentQuery, usePostCommentMutation, useToggleDisLikeCommentMutation, useToggleLikeCommentMutation, useToggleOnPostMutation } from "../../redux/api/api";
import moment from "moment";
import RenderPostContent from "../specific/RenderPostContent";
import { toast } from "react-toastify";
import ImageSlider from "../ui/ImagesSlider";
import TextArea from 'react-textarea-autosize'
import CommentCardSkeleton from "../shared/CommentCardSkeleton";



function CommunityPostPage({community}) {
  const {id} = useParams() ;
  const {user} = useSelector(state => state.auth) ;

  const [comments, setComments] = useState([]);
  const [communities , setCommunities] = useState([
    { id: 1, name: 'Web Dev', avatar: '🌐' },
    { id: 2, name: 'AI & ML', avatar: '🤖' },
    { id: 3, name: 'Gaming', avatar: '🎮' },
    { id: 4, name: 'Startups', avatar: '🚀' },
  ]);

  const [commentLoader ,  setCommentLoader] = useState(false) ;

  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState('Top');
  const [isOpenOptions , setIsOpenOptions] = useState(false) ;
  const [ totalPages , setTotalPages] = useState(1);
  const [ page , setPage] = useState(1);

  
  const [post , setPost] = useState({}) ;
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [likeStatus, setLikeStatus] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [bookmarkStatus, setBookmarkStatus] = useState(false);

  const [commentPostMutation] = usePostCommentMutation() ;
  const {data  , isError , isLoading , error} = useGetPostQuery(id);
  
  const [fetchMoreComments , {data : newCommentData , isLoading : isLoadingComments , isError : isErrorComments}] = useLazyGetCommentQuery() ;

  useEffect(() => {
      if(page === 1) fetchMoreComments({page : 1 , sortBy , id , isComment : false , comment_id : null}) ;
  } , [])


  useEffect(() => {
    if(newCommentData && newCommentData.data){
      console.log(newCommentData.data);
      
      setComments((prev) => {
        if (prev.length &&
          prev.at(-1)?._id === newCommentData.data.comments.at(-1)?._id
        ) {
          return prev ;
        }
        return [...prev, ...newCommentData.data.comments]}) ;
        
      setTotalPages(newCommentData.data.totalPages) ;
      setPage(prev => prev + 1) ;
    }
  } , [newCommentData])

  const handleCommentSubmit = async(e) => {
    e.preventDefault();
    setCommentLoader(true) ;
    try {
      const res = await commentPostMutation({postId : id , content : newComment , isEdited : false , mentions : []}).unwrap() ;
      
      setNewComment('');
      setComments(prev => [ {
        ...res.data ,
        author : {
          username : user?.username ,
          avatar : {
            url : user?.avatar?.url ,
          } ,
        }
      } , ...prev])
    } catch (error) {
      console.log('error in posting comment' , error);
      toast.error(error?.data?.message || "Couldn't post the comment. Please try again.");
    } finally{
      setCommentLoader(false);
    }
  };
  const [toggleMutation] = useToggleOnPostMutation() ;
  const [deleteMutation] = useDeleteCommentMutation() ;

  const toggleLiketFunc = async(option) => {
    try {
      const data = await toggleMutation({id :post._id , option : option }).unwrap() ;
      if(data.data.operation){
        setLikeStatus(true)
        setTotalLikes(prev => prev + 1)
      }else {
        setLikeStatus(false)
        setTotalLikes(prev => prev - 1)
      }
    } catch (error) {
      console.log('error in doing like' , error);
    }
  }
  const togglePostFunc = async(option) => {
    if(!post._id) return toast.info('Post is still loading.') ; 
    try {
      const data  = await toggleMutation({id :post._id , option : option }).unwrap() ;
      if(data.data.operation){
        if(option === 'pin'){
          setPinStatus(true)
        }else if(option === 'bookmark'){
          setBookmarkStatus(true)
        }
        toast.success(`Post ${option === 'pin' ? 'Pinned' : 'bookmarked'} successfully!` )
        setOpenOptions(false)
      }else {
        if(option === 'pin'){
          setPinStatus(false)
        }else if(option === 'bookmark'){
          setBookmarkStatus(false)
        }
        toast.success(`Post ${option === 'pin' ? 'Unpinned' : 'removed from bookmarks'} successfully!` )
        setOpenOptions(false)
      }
    } catch (error) {
      console.log('error in doing toggle post operation', error);
    }
  }
  useEffect(() => {
    if(data) 
      setPost(data?.data) ;
      setLikeStatus(data?.data?.likeStatus) ;
      setBookmarkStatus(data?.data?.bookmarkStatus) ;
      setTotalLikes(data?.data?.likeCount) ;
  } , [data])

  useEffect(() => {
    if(isError){
      toast.error(error?.data?.message || "Couldn't fetch the post. Please try again.");
      console.log(isError , error);}
  } , [isError , error])




  return (
    <div className="min-h-screen dark:bg-[#000] dark:text-white sm:p-6 p-1  ">
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 h-full w-full"> 
        <div className="col-span-4 lg:col-span-3"> 
          {/* Post Header */}
          
          <div className="max-w-3xl mx-auto dark:bg-black p-6 rounded-xl border border-gray-200 custom-box ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Posted in <Link to={'/community/c/'+community?._id} className="text-indigo-400">{post?.community?.name}</Link> by{" "}
                  <Link to={'/profile/'+post?.author?.username} className="text-cyan-500 ">@{post?.author?.username}</Link> • {moment( post.createdAt).calendar()} 
                </p>
                <h1 className="text-2xl font-bold mt-2">
                  {post?.title}
                </h1>
              </div>
              <img
                src={ post?.community?.avatar?.url }
                alt="Community Icon"
                className="w-12 h-12 rounded-full border-[1px] dark:border-white border-black"
              />
            </div>

            {/* Post Content */}
            <div className="mt-4 dark:text-gray-300">
              <p>
                <RenderPostContent text={post?.content} />
              </p>
              <ImageSlider images={post?.media} />
            </div>

            {/* Post Actions */}
            <div className="mt-6 flex flex-wrap items-center  gap-6 text-sm">
              <button
                onClick={() => { toggleLiketFunc('like') }}
                className={`flex items-center gap-1 `}
              >
                <HeartIcon size={16} className={` ${
                  likeStatus ? 'fill-red-500' : ''
                } duration-200 hover:scale-110 active:scale-95 text-red-500`} />
                {totalLikes}
              </button>

              <button className="flex items-center gap-1 hover:text-green-500">
                <Share2Icon size={16} className='fill-blue-600 text-blue-600' />
                Share
              </button>

              <button className="flex items-center gap-1 hover:text-green-500">
                <Repeat2Icon size={16} className=' text-green-600' /> 
                Repost
              </button>

              <button
                onClick={() => togglePostFunc('bookmark')}
                className={`flex items-center gap-1 `}
              >
                <BookmarkIcon size={16} className={`${ bookmarkStatus ? 'fill-yellow-500 text-yellow-500' : ''  } duration-200 text-yellow-500` } />
                {post?.bookmarkCount || ''} {bookmarkStatus ? 'Saved' : 'Saves'} 
              </button>
              <div className='  text-gray-400 font-semibold duration-200 my-1 flex items-center justify-end text-sm'>
                <BarChart2Icon size={16} className=' text-cyan-600' /> 
                {post?.views ?? 0} views
              </div>
            </div>
          </div>


          {/* Comment Section */}
          <div className="max-w-full mx-auto mt-6 dark:bg-[#000] p-3 rounded-xl shadow-md">
            {/* comment Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Comments</h2>
              <div className="flex items-center gap-1 relative z-10"
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

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
              <TextArea maxRows={4}
                type="text"
                placeholder="Write a comment..."
                className="w-full p-1 py-2 focus:pl-3 rounded  duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit"
                disabled={commentLoader || (!newComment.trim())}
               className="bg-white  text-black font-semibold active:scale-95 duration-200 shadow-slate-500 dark:shadow-none shadow-md  px-6 py-2 rounded-lg "
              >
                {commentLoader ? <Loader2Icon className='animate-spin'/> : 'Post'}
              </button>
            </form>

            {/* Comment List */}
            {isLoadingComments ? 
            Array.from({length : 4}).map((_ , i) => (
              <div className="mb-1"><CommentCardSkeleton key={i}/></div>
            ))
            : (
              <div className="space-y-4">
                <CommentsThread commentsArr={comments} id={id} fetchMoreComments={fetchMoreComments} />
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className=" col-span-full lg:col-span-1 bg-white dark:bg-black "> 
          <div className="bg-[#f1f1f1] p-6 rounded-xl border-y-2 border-gray-200 custom-box">
            <h2 className="text-lg font-semibold mb-4">Related Communities</h2>
            <ul className="space-y-3">
              {communities.map((comm) => (
                <li
                  key={comm.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-slate-300  dark:hover:bg-gray-800 px-3 py-2 rounded-lg duration-200"
                >
                  <span className="text-xl">{comm.avatar}</span>
                  <span>{comm.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityPostPage;



function Comment({ comment,  id , nestedNo , closePreThreadFunc }) {
  const {user} = useSelector(state => state.auth) ;

  const renderPreRef = useRef(null) ;
  const [ContinueThread , setContinueThread] = useState(false) ;

  const [isDeleted , setIsDeleted] = useState(comment?.isDeleted) ;
  const [expandable , setExpandable] = useState(false) ;
  const [textExpended , setTextExpended] = useState(false) ;
  const [commentLoader ,  setCommentLoader] = useState(false) ;

  const [showReply, setShowReply] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [likeCount , setLikeCount] = useState(comment?.likeCount) ;
  const [dislikeCount , setDislikeCount] = useState(comment?.dislikeCount) ;

  const [isOpenOptions , setOpenOptions] = useState(false) ;
  const [likeStatus , setLikeStatus] = useState(comment.likeStatus) ;
  const [dislikeStatus , setDislikeStatus] = useState(comment?.dislikeStatus) ;

  const [toggleLikeMutation] = useToggleLikeCommentMutation();
  const [toggleDislikeMutation] = useToggleDisLikeCommentMutation();
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
          disabled={isDeleted} 
          onClick={toggleLiketFunc} 
          className="flex items-center dark:hover:text-white gap-1"> 
            <ThumbsUpIcon className={`${likeStatus ? 'dark:fill-gray-300 dark:text-gray-300 fill-cyan-500 text-cyan-500' : ''}  hover:text-gray-600 dark:hover:text-white active:scale-75 duration-200`} size={17} /> 
            {' '} {likeCount}
          </button> 
          <button 
          disabled={isDeleted} 
          onClick={toggleDisLiketFunc} 
          className="flex items-center dark:hover:text-white gap-1"> 
            <ThumbsDownIcon className={`${dislikeStatus ? 'dark:fill-gray-300 dark:text-gray-300 fill-cyan-500 text-cyan-500' : ''} active:scale-75  hover:text-gray-600 dark:hover:text-white duration-200`} size={17} /> 
            {' '} {dislikeCount} 
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
            className="w-full p-1 py-1 focus:pl-3 rounded-sm  duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
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
