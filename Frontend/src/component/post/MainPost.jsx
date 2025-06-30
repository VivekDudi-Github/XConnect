import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Clock,
  Pencil,
  Trash,
  Flag,
  PinIcon,
  Repeat2Icon,
  BarChart3Icon,
  BarChart2,
} from 'lucide-react';
import InPostImages from './InPostImages';
import {  useEffect, useState  } from 'react';
import { useSelector } from 'react-redux';
import {useParams} from 'react-router-dom' ;
import {useGetPostQuery, useToggleOnPostMutation} from '../../redux/api/api'
import MainPostSkeleton from '../shared/MainPostSkeleton';
import moment from 'moment'
import RenderPostContent from '../specific/RenderPostContent';
import { toast } from 'react-toastify';

export default function PostViewPage() {
  const {user} = useSelector(state => state.auth) ;
  const {id} = useParams() ;
  
  const [post , setPost] = useState({}) ;
  
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

  if(isLoading) return <MainPostSkeleton/>

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-4 dark:text-white shadow-lg shadow-slate-800/50 rounded-lg">
      {/* Author + Timestamp + Options */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <img
            src={post?.author?.avatar?.url ? post?.author?.avatar?.url : '/avatar-default.svg'}
            alt={post?.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold">{post?.author?.fullname}</span>
            <span className="text-sm text-gray-500">{post?.author?.username}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1 my-0.5 font-semibold ">
              <Clock size={12} />
              {moment( post.createdAt).calendar()}
            </span>
          </div>
        </div>

        {/* Options menu */}
        <div className="relative flex gap-1">
          <span className="text-xs font-semibold -translate-y-52 sm:translate-y-0 duration-200 text-cyan-900 dark:text-white bg-slate-800/50  rounded-lg px-2 py-[2px] flex">  
            <BarChart2 size={16} className=' text-cyan-600' />
            500 views
          </span>   
          {post?.IsEdited ? <div className=' text-xs text-cyan-400 bg-slate-800 rounded-xl px-2 py-[2px] '>Edited</div> : null}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-500 hover:text-black"
          >
            <MoreHorizontal size={20} />
          </button>

            <div className={`absolute right-4 top-2 mt-2 bg-white shadow-md shadow-black/50 dark:bg-gray-800 rounded-md text-sm z-30 w-28 duration-200 ${menuOpen ? '' : 'scale-0 translate-x-14 -translate-y-14 '} `}> 
                {user?._id === post?.author?._id && (
                  <>
                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
                  <Pencil size={14} className="mr-2" /> Edit
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
                    <Trash size={14} className="mr-2" /> Delete
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
                    <PinIcon size={14} className="mr-2" /> Pin
                  </button>
                  </>
                ) } 
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
                <Flag size={14} className="mr-2" /> Report
              </button>
            </div>
        </div>
      </div>

      {/* Post Content */}
      {post?.content && (
        <pre className="dark:text-gray-300 mb-2 font-sans text-wrap">
          {<RenderPostContent text={post?.content} />} 
        </pre>
      )}

      {/* Media */}
      {post?.media && post?.media.length > 0 && (
        <div className="mt-4">
          <InPostImages imagesArray={post.media} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center  gap-6 text-sm">
          <button
            onClick={() => { toggleLiketFunc('like') }}
            className={`flex items-center gap-1 `}
          >
            <Heart size={16} className={` ${
              likeStatus ? 'fill-red-500' : ''
            } duration-200 hover:scale-110 active:scale-95 text-red-500`} />
            {totalLikes}
          </button>

          <button className="flex items-center gap-1 hover:text-green-500">
            <Share2 size={16} className='fill-blue-600 text-blue-600' />
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
            <Bookmark size={16} className={`${ bookmarkStatus ? 'fill-yellow-500 text-yellow-500' : ''  } duration-200 text-yellow-500` } />
            {post?.bookmarkCount || ''} {bookmarkStatus ? 'Saved' : 'Saves'} 
          </button>
          </div>
          <div className='  sm:translate-x-full sm:mt-0 mt-3 text-gray-400 font-semibold duration-200 my-1 flex items-center justify-end text-sm'>
            <BarChart2 size={16} className=' text-cyan-600' /> 
            500 views
          </div>

    </div>
  );
}
