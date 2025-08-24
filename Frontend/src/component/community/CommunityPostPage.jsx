import { BarChart2Icon, BookmarkIcon, ChevronDown, EllipsisVerticalIcon, HeartIcon, MessageSquareIcon, Pin, PinIcon, Repeat2Icon, Share2Icon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetPostQuery, useToggleOnPostMutation } from "../../redux/api/api";
import moment from "moment";
import RenderPostContent from "../specific/RenderPostContent";
import { toast } from "react-toastify";
import ImageSlider from "../shared/ImagesSlider";


function CommunityPostPage({community}) {
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "@john",
      text: "This is a great discussion topic! I think we should test this idea before implementing.I think we should test this idea before implementing.I think we should test this idea before implementing",
      time: "3h ago",
      likes: 2,
      replies: [
        {
          id: 2,
          user: "@sarah",
          text: "I totally agree with you!",
          time: "2h ago",
          likes: 1,
          replies: [{
            id: 2,
            user: "@sarah",
            text: "I totally agree with you!",
            time: "2h ago",
            likes: 1,
            replies: [{
              id: 2,
              user: "@sarah",
              text: "I totally agree with you!",
              time: "2h ago",
              likes: 1,
              replies: [],
              },
            ],
          },
        ],
        },
        {id: 10,
          user: "@mike",
          text: "I think we should test this idea before implementing.",
          time: "1h ago",
          likes: 9,
          replies: [],
        } ,
        {id: 11,
          user: "@mike",
          text: "I think we should test this idea before implementing.I think we should test this idea before implementing.I think we should test this idea before implementing.",
          time: "1h ago",
          likes: 3,
          replies: [],
        } ,
        {id: 12,
          user: "@mike",
          text: "I think we should test this idea before implementing.",
          time: "1h ago",
          likes: 5,
          replies: [],
        }
      ],
    },
    
    {
      id: 3,
      user: "@mike",
      text: "I think we should test this idea before implementing.",
      time: "1h ago",
      likes: 0,
      replies: [],
    },
  ]);
  const [communities , setCommunities] = useState([
    { id: 1, name: 'Web Dev', avatar: '🌐' },
    { id: 2, name: 'AI & ML', avatar: '🤖' },
    { id: 3, name: 'Gaming', avatar: '🎮' },
    { id: 4, name: 'Startups', avatar: '🚀' },
  ]);

  const [commentLoader ,  setCommentLoader] = useState(false) ;

  const [newComment, setNewComment] = useState("");


  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), user: "@you", text: newComment, time: "Just now" },
    ]);
    setNewComment("");
  };

 const {user} = useSelector(state => state.auth) ;
  const {id} = useParams() ;

  
  const [post , setPost] = useState({}) ;
  console.log(post);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [likeStatus, setLikeStatus] = useState( 0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [bookmarkStatus, setBookmarkStatus] = useState(false);

  const {data  , isError , isLoading , error} = useGetPostQuery(id)
  
  
  const [toggleMutation] = useToggleOnPostMutation() ;

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
          
          <div className="max-w-3xl mx-auto dark:bg-black p-6 rounded-xl border border-gray-200  custom-box ">
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
                500 views
              </div>
            </div>
              
          </div>


          {/* Comment Section */}
          <div className="max-w-full mx-auto mt-6 dark:bg-[#000] p-3 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Comments</h2>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 dark:bg-[#0d1117] shadowLight duration-200 outline-none" 
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
            <div className="space-y-4">
              <CommentsThread commentsArr={comments} />
            </div>
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



function Comment({ comment, onReply }) {

  const renderPreRef = useRef(null) ;
  const [expandable , setExpandable] = useState(false) ;
  const [textExpended , setTextExpended] = useState(false) ;

  const [showReply, setShowReply] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [isOpenOptions , setOpenOptions] = useState(false) ;
  const [pinStatus , setPinStatus] = useState(false) ;
  const [likeStatus , setLikeStatus] = useState(false) ;



  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setShowReplyBox(false);
  };

  useEffect(() => {
    const timer =setTimeout(() => {
      if(renderPreRef.current){
      if(renderPreRef.current.scrollHeight > 50 ){
        console.log('triggered expandable');
        
        setExpandable(true)
      }
    }
    } , 50)

    return () => clearTimeout(timer) ;
  } , [])

  return (
    <div className="mb-4 ">
      {/* Comment Content */}
      <div className="dark:bg-[#000]  text-black dark:text-white border-t-2 border-gray-700 p-2 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/avatar-default.svg" alt="" className="w-8 h-8 border  rounded-full"/> 
            <Link to={'/profile/'+comment.user} className="text-sm text-slate-400">
              <span className="dark:text-cyan-600">{comment.user}</span> • {comment.time}
            </Link>
          </div>
          <EllipsisVerticalIcon size={17} />
          <div className={`absolute w-40 top-2 right-6 duration-200 bg-white dark:bg-slate-800 shadow-md shadow-black/60 rounded-lg ${isOpenOptions ? '' : 'scale-0 translate-x-14 -translate-y-14 ' }  `}> 
            <div 
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer"
          >
            <PinIcon size={17} />
            <span>{pinStatus ? 'Unpin' : 'Pin'}</span>
          </div> 
          </div>
        </div>

        <div className={` overflow-hidden transition-[max-height] duration-500 ease-in-out  `}
          style={{
            maxHeight : textExpended ? '800px' : '48px' ,
          }}
          >
          <pre ref={renderPreRef} className="dark:text-gray-300 text-sm mb-0.5 font-sans text-wrap"><RenderPostContent text={comment?.text}/></pre>
        </div>
        <button 
          onClick={() => setTextExpended((prev) => !prev)}
          className={`text-gray-500 mb-1 text-sm font-sans text-wrap block ${expandable ? '' : 'hidden'}`}>
              {textExpended ? 'show less..' : 'read more...'}
        </button>

        <div className="mt-2 text-sm text-gray-500 flex gap-4 items-center">
        
        {/* <button  */}
        { comment.replies.length > 0 && <button  
          onClick={() => setShowReply(!showReply)}
          className={`flex justify-between items-center gap-1 dark:hover:text-white `}>
            {comment?.replies.length } Replies 
            <ChevronDown className={` ${!showReply ? '' : ' rotate-180'} duration-200`} size={15}/> 
        </button>
        }

          <button className="flex items-center dark:hover:text-white gap-1"> 
            <ThumbsUpIcon className={`${likeStatus ? 'dark:fill-gray-300 fill-cyan-500' : ''}  hover:text-gray-600 dark:hover:text-white duration-200`} size={17} /> {' '} {comment.likes}
          </button> 
          <button className="flex items-center dark:hover:text-white gap-1"> 
            <ThumbsDownIcon className={`${!likeStatus ? 'dark:fill-gray-300 dark:text-gray-300 fill-cyan-500 text-cyan-500' : ''}  hover:text-gray-600 dark:hover:text-white duration-200`} size={17} /> {' '} {comment.likes}
          </button> 
          <button className="flex items-center gap-1 dark:hover:text-white" onClick={() => setShowReplyBox(!showReplyBox)}><MessageSquareIcon size={15} /> 
            Add Reply
          </button>
          
        </div>
      </div>

      {/* Reply Box */}
      {showReplyBox && (
        <div className="ml-6 mt-2">
          <textarea
            rows="2"
            placeholder="Write a reply..."
            className="w-full bg-[#161b22] border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          ></textarea>
          <div className="flex gap-2 font-semibold mt-2">
            <button
              onClick={handleReply}
              className="bg-cyan-600 text-black hover:text-white hover:bg-cyan-500 px-4 py-1 rounded text-sm shadowLight" 
            >
              Reply
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
      {showReply && comment.replies?.length > 0 && (
        <div className="ml-6 mt-3 border-l border-gray-700 pl-4">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}

    </div>
  );
}

function CommentsThread({commentsArr = []}) {
  const [comments, setComments] = useState(commentsArr || []);

  const handleReply = (parentId, replyText) => {
    const newReply = {
      id: Date.now(),
      user: "@you",
      text: replyText,
      time: "Just now",
      likes: 0,
      replies: [],
    };

    const addReply = (list) =>
      list.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...c.replies, newReply] }
          : { ...c, replies: addReply(c.replies) }
      );

    setComments((prev) => addReply(prev));
  };

  return (
    <div className="w-full mx-auto text-white rounded-xl border custom-box  ">

      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onReply={handleReply} />
      ))}
    </div>
  );
}
