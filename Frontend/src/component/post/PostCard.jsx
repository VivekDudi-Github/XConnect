import { BookmarkCheckIcon, BookmarkIcon, EllipsisVerticalIcon, GlobeIcon, Heart, MessageCircle, PinIcon, PinOffIcon, Trash2Icon } from 'lucide-react';
import InPostImages from './InPostImages';
import { NavLink } from 'react-router-dom';
import moment from 'moment'
import { useDeletePostMutation, useToggleOnPostMutation } from '../../redux/api/api'; 
import { useEffect, useRef, useState } from 'react';
import { useSelector , useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import RenderPostContent from '../specific/RenderPostContent';
import DialogBox from '../shared/DialogBox';
import { setisDeleteDialog } from '../../redux/reducer/miscSlice';





export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth)
  const renderPreRef = useRef(null) ;

  const [expandable , setExpandable] = useState(false) ;
  const [textExpended , setTextExpended] = useState(false) ;


  const [isOpenOptions , setOpenOptions] = useState(false) ;
  const [likeStatus , setLikeStatus] = useState(post.likeStatus) ; 
  const [totalLikes , setTotalLikes] = useState(post.likeCount) ;

  const [pinStatus , setPinStatus] = useState(post.isPinned) ;
  const [bookmarkStatus , setBookmarkStatus] = useState(post.isBookmarked) ;

  const [toggleMutation] = useToggleOnPostMutation() ;
  const [deleteMutation] = useDeletePostMutation() ;


  const toggleLiketFunc = async(option) => {
    try {
      const data  = await toggleMutation({id :post._id , option : option }).unwrap() ;
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

  const openOptionsHandler = (postId) => {
    setOpenOptions(prev => !prev);
  }

useEffect(() => {
  if(renderPreRef.current){
    if(renderPreRef.current.scrollHeight > 50 ){
      setExpandable(true)
    }
  }
} , [post.content , renderPreRef?.current?.scrollHeight])

  return (
    <article className="bg-white w-full mx-auto relative rounded-xl dark:shadow-sm p-2 mb-4 dark:bg-black  dark:from-slate-900 dark:to-black dark:text-white shadow-slate-400 shadow-lg border-t dark:border-y dark:border-white dark:border-b-gray-600 border-slate-800/50 duration-200 break-inside-avoid  ">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2 pr-7">
        <div className='flex justify-between gap-2'>
          <NavLink to={`/profile/${post?.author?.username}`}>
            <img
              src={post?.author?.avatar?.url || post.avatar || '/avatar-default.svg'}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover "
            />
          </NavLink>
          <NavLink to={`/profile/${post?.author?.username}`}>
            <h2 className="font-semibold">{post.author.fullname}
            <div className='text-sm text-gray-500 hover:text-blue-400'> @{post.author.username} </div>
            </h2>
          </NavLink>
        </div>

      </div>

      <div 
      onClick={() => openOptionsHandler(post._id)}
      className=' absolute top-4 right-2 dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-2 duration-200'>
      
      {/* Options */}
        <EllipsisVerticalIcon size={17}/>
        <div className={`absolute w-40 top-2 right-6 duration-200 bg-white dark:bg-slate-800 shadow-md shadow-black/60 rounded-lg  ${isOpenOptions ? '' : 'scale-0 translate-x-14 -translate-y-14 ' }  `}>
          
          <div 
          onClick={() => togglePostFunc('pin')}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer"
          >
            {pinStatus ? (<PinOffIcon size={17} />) : (<PinIcon size={17} />)}
            <span>{pinStatus ? 'Unpin' : 'Pin'}</span>
          </div> 
          
          <div
          onClick={() => togglePostFunc('bookmark')}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer"
          >
            {bookmarkStatus ?  <BookmarkCheckIcon size={17} />  : <BookmarkIcon size={17} />}
            <span>{  bookmarkStatus ? 'Bookmarked' : 'Bookmark' }</span>
          </div>
          
          {user?._id === post?.author?._id && 
          <div 
          onClick={() => dispatch(setisDeleteDialog({
            isOpen : true ,
            postId : post._id
          }))}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Trash2Icon size={17} />
            <span>Delete Post</span>
          </div>
          }
        </div>
      </div>

      {/* Content */}
      <div className={` overflow-hidden transition-[max-height] duration-1000 ease-in-out `}
      style={{
        maxHeight : textExpended ? '800px' : '48px' ,
      }}
      >
        <pre ref={renderPreRef} className="dark:text-gray-300 mb-2 font-sans text-wrap"><RenderPostContent text={post?.content}/></pre>
      </div>
      <button 
      onClick={() => setTextExpended((prev) => !prev)}
      className={`text-gray-500 mb-1 font-sans text-wrap ${expandable ? '' : 'hidden'}`}>
            {textExpended ? 'show less..' : 'read more...'}
      </button>

      {/* Image */}
      {post.media && post.media.length > 0 && (
        <InPostImages imagesArray={post.media}/>
      )}

      {/* Actions */}
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <div className='flex gap-2 items-center'>
          <button 
          className="flex items-center gap-1" 
          onClick={() => toggleLiketFunc('like')}
          >
            <Heart 
            className={ ` text-pink-600  dark:hover:fill-white hover:fill-pink-600 duration-500 hover:scale-110 active:scale-95 ${ likeStatus ? ' fill-pink-600' : 'dark:text-white'} `} 
            size={18} /> 
            {totalLikes}
          </button>

          <NavLink to={`/post/${post._id}`} className="flex items-center gap-1">
            <MessageCircle className=' text-blue-600 dark:text-white  dark:hover:fill-white hover:fill-blue-600 duration-500 hover:scale-110 active:scale-95' size={18} /> {post?.commentCount}
          </NavLink>
        </div>
        <span className="text-xs text-gray-500">
            • {moment(post.updatedAt).fromNow()}
        </span>
      </div>
    </article>
  );
}
