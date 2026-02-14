import {BarChart2Icon , MessageCircleIcon , EllipsisVerticalIcon , BookmarkIcon, BookmarkCheckIcon, PinIcon, PinOffIcon, Trash2Icon, } from 'lucide-react';
import { Link } from 'react-router-dom';
import InPostImages from '../post/InPostImages';
import moment from 'moment';
import { useOnScreen } from '../specific/useOnScreen';
import { useEffect, useState } from 'react';
import { useIncreasePostViewsMutation } from '../../redux/api/api';
import { setisDeleteDialog } from '../../redux/reducer/miscSlice';
import { useSelector } from 'react-redux';

const CommunityPostCard = ({ post , heading }) => {
  const {
    community,
    author,
    title,
    content,
    media,
    createdAt,
    isAnonymous = false ,
  } = post;

  const {user} = useSelector(state => state.auth) ;

  const [increaseView] = useIncreasePostViewsMutation() ;

  const [ref , isVisible] = useOnScreen({threshold : 0.5 }) ;
  const [isOpenOptions , setOpenOptions] = useState(false) ;

  const [pinStatus , setPinStatus] = useState(post.isPinned) ;
  const [bookmarkStatus , setBookmarkStatus] = useState(post.isBookmarked) ;
  
  const openOptionsHandler = (postId) => {
    setOpenOptions(prev => !prev);
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


  useEffect(() => {
    if(isVisible){
      const key = `views-${post._id}` ;

      if(!sessionStorage.getItem(key)){
        increaseView({id : post._id}) ;
        sessionStorage.setItem(key , true) ;
      }
    }
  } , [isVisible])
  // console.log(ref.current);
  
  return (
    <div ref={ref} className=' mb-4 scale-100 fade-in '>
      {/* Top Info */}
      {heading && (
        <div className=" flex justify-start items-center px-4 ">  
          <Link to={`/communities/c/${post.communityId}`}
           className='text-black font-bold rounded-t-xl bg-black dark:bg-white px-4'>
            <span className="font-e text-xs text-white dark:text-purple-800 overflow-hidden">Posted in {community}</span>            
          </Link>
        </div>
      )}
      <div className="bg-white rounded-xl p-2 custom-box"> 
        {/* User Info */}
        <div className="text-xs sm:text-[13px] text-gray-500 mb-2 relative">
          {!isAnonymous ? (
            <Link to={`/profile/${author?.username}`}>
              Posted by <span className="text-blue-400">@{author.username}</span>
            </Link>
          ) : (
            <span >
              Posted by <span className="dark:text-gray-400 font-medium text-gray-800 ">Anonymous User</span>
            </span>
          )}
           &nbsp; • <span>{moment(createdAt).fromNow()}</span>
        </div>

        {/* Title */}
        <Link to={`/communities/post/${post._id}`}>
          <h2 className="text-lg font-bold text-gray-700 dark:text-white mb-2">{title}</h2>
        </Link>

        {/* content (truncated to ~160 chars) */}
        <p className="text-[13.5px] text-gray-600 font-semibold dark:text-gray-400 mb-3">
          {content?.length > 120 ? `${content.slice(0, 120)}...` : content} 
        </p>

        {/* Optional Image */}
        {media?.length > 0 && (
          <div className="mb-3 ">
            <InPostImages imagesArray={[media[0]  ]} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center py-2 border-b border-gray-700 mt-3 text-sm text-gray-400  font-semibold"> 
          <Link to={`/communities/post/${post._id}`} className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
           <MessageCircleIcon size={17} /> <span>{post?.commentCount ?? ''} Comment</span>
          </Link>
          <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
            <BarChart2Icon size={17} className=' text-cyan-500 '/><span>{post?.views ?? 0} Views</span> 
          </button>
        </div>

        <div 
        onClick={() => openOptionsHandler(post._id)}
        className=' absolute top-8 right-2 dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-2 duration-200'>
        
          {/* Options */}
          <EllipsisVerticalIcon size={17}/>
          <div className={`absolute z-10 w-40 top-4 right-6 duration-200 bg-white dark:bg-slate-800 shadow-md shadow-black/60 rounded-lg ${isOpenOptions ? '' : 'scale-0 translate-x-14 -translate-y-14 ' }  `}> 
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
      </div>
    </div>
  );
};

export default CommunityPostCard