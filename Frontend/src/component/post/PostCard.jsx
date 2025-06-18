import { BookmarkCheckIcon, BookmarkIcon, EllipsisVerticalIcon, GlobeIcon, Heart, MessageCircle, PinIcon, PinOffIcon, Trash2Icon } from 'lucide-react';
import InPostImages from './InPostImages';
import { NavLink } from 'react-router-dom';
import moment from 'moment'
import { useToggleOnPostMutation } from '../../redux/api/api'; 
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function PostCard({ post }) {
  const {user} = useSelector(state => state.auth)

  const [isOpenOptions , setOpenOptions] = useState(false) ;
  const [likeStatus , setLikeStatus] = useState(post.likeStatus) ; 
  const [totalLikes , setTotalLikes] = useState(post.totalLikes) ;

  const [pinStatus , setPinStatus] = useState(post.isPinned) ;
  const [bookmarkStatus , setBookmarkStatus] = useState(post.isBookmarked) ;

  const [toggleMutation] = useToggleOnPostMutation()

  const toggleLiketFunc = async(option) => {
    try {
      const data  = await toggleMutation({id :post._id , option : option }).unwrap() ;
      if(data.data.opertation){
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
      if(data.data.opertation){
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

  const deleteFunc = () => {
  }
console.log(pinStatus);

  return (
    <article className="bg-white w-full mx-auto relative rounded-xl dark:shadow-sm p-4 mb-4 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black dark:text-white shadow-slate-800/50 shadow-lg border-t border-slate-800/50 duration-200 break-inside-avoid  ">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post?.author?.avatar?.url || post.avatar || '/avatar-default.svg'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover "
        />
        <div>
          <h2 className="font-semibold">{post.author.fullname}
          <NavLink className='text-sm text-gray-500 hover:text-blue-400'> @{post.author.username} </NavLink>
          </h2>
          <span className="text-xs text-gray-500">
            • {moment(post.updatedAt).fromNow()}
          </span>
        </div>
      </div>

      <div 
      onClick={() => openOptionsHandler(post._id)}
      className=' absolute top-4 right-2 dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-2 duration-200'>
      
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
          {user._id === post?.author?._id && 
          <div 
          onClick={() => deleteFunc()}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Trash2Icon size={17} />
            <span>Delete Post</span>
          </div>
          }
        </div>
      </div>

      {/* Content */}
      <pre className="dark:text-gray-300 mb-2 font-sans">{post.content}</pre>

      {/* Image */}
      {post.media && post.media.length > 0 && (
        <InPostImages imagesArray={post.media}/>
      )}

      {/* Actions */}
      <div className="flex gap-6 text-sm text-gray-600 mt-2">
        <button 
        className="flex items-center gap-1" 
        onClick={() => toggleLiketFunc('like')}
        >
          <Heart 
          className={ ` text-pink-600  dark:hover:fill-white hover:fill-pink-600 duration-500 hover:scale-110 active:scale-95 ${ likeStatus ? ' fill-pink-600' : 'dark:text-white'} `} 
          size={18} /> 
          {totalLikes}
        </button>

        <button className="flex items-center gap-1">
          <MessageCircle className=' text-blue-600 dark:text-white  dark:hover:fill-white hover:fill-blue-600 duration-500 hover:scale-110 active:scale-95' size={18} /> {post.comments}
        </button>
      </div>
    </article>
  );
}
