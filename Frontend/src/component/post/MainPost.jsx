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
} from 'lucide-react';
import InPostImages from './InPostImages';
import { useEffect, useState  } from 'react';
import { useSelector } from 'react-redux';
import {useParams} from 'react-router-dom' ;
import {useGetPostQuery} from '../../redux/api/api'
import MainPostSkeleton from '../shared/MainPostSkeleton';
import moment from 'moment'
import RenderPostContent from '../specific/RenderPostContent';


export default function PostViewPage() {
  const {user} = useSelector(state => state.auth) ;
  const {id} = useParams() ;
  
  const [post , setPost] = useState({}) ;
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const {data , isError , isLoading , error} = useGetPostQuery(id)
  
  useEffect(() => {
    if(data) 
      setPost(data?.data) ;
      
  } , [data])


  if(isLoading) return <MainPostSkeleton/>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 dark:text-white shadow-md shadow-black/60 rounded-lg">
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
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock size={12} />
              {moment( post.createdAt).fromNow()}
            </span>
          </div>
        </div>

        {/* Options menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-500 hover:text-black"
          >
            <MoreHorizontal size={20} />
          </button>

            <div className={`absolute right-0 mt-2 bg-white shadow-md shadow-black/50 dark:bg-gray-800 rounded-md text-sm z-30 w-28 duration-200 ${menuOpen ? '' : 'scale-0 translate-x-14 -translate-y-14 '} `}> 
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
                <Pencil size={14} className="mr-2" /> Edit
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
                <Trash size={14} className="mr-2" /> Delete
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-900 cursor-pointer">
                <Flag size={14} className="mr-2" /> Report
              </button>
            </div>
        </div>
      </div>

      {/* Post Content */}
      {post?.content && (
        <pre className="dark:text-gray-300 mb-2 font-sans text-wrap">
          {RenderPostContent(post?.content)}
        </pre>
      )}

      {/* Media */}
      {post?.media && post?.media.length > 0 && (
        <div className="mt-4">
          <InPostImages imagesArray={post.media} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center gap-6 text-gray-600 text-sm">
        <button
          onClick={() => {
            setLiked(!liked);
            setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
          }}
          className={`flex items-center gap-1 ${
            liked ? 'text-red-500' : 'hover:text-red-500'
          }`}
        >
          <Heart size={16} />
          {likeCount}
        </button>

        <button className="flex items-center gap-1 hover:text-green-500">
          <Share2 size={16} />
          Share
        </button>

        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`flex items-center gap-1 ${
            bookmarked ? 'text-yellow-500' : 'hover:text-yellow-500'
          }`}
        >
          <Bookmark size={16} />
          {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>

    </div>
  );
}
