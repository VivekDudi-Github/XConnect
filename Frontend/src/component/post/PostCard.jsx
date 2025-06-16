import { Heart, MessageCircle } from 'lucide-react';
import InPostImages from './InPostImages';
import { NavLink } from 'react-router-dom';
import moment from 'moment'
 
export default function PostCard({ post }) {
  
  return (
    <div className="bg-white w-full mx-auto rounded-xl dark:shadow-sm p-4 mb-4 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black dark:text-white shadow-slate-800/50 shadow-lg border-t border-slate-800/50 duration-200 ">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post.avatar || '/avatar-default.svg'}
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

      {/* Content */}
      <pre className="dark:text-gray-300 mb-2 font-sans">{post.content}</pre>

      {/* Image */}
      {post.media && post.media.length > 0 && (
        <InPostImages imagesArray={post.media}/>
      )}

      {/* Actions */}
      <div className="flex gap-6 text-sm text-gray-600 mt-2">
        <button className="flex items-center gap-1">
          <Heart className=' text-pink-600 dark:text-white dark:hover:fill-white hover:fill-pink-600 duration-500 hover:scale-110 active:scale-95 ' size={18} /> {post.likes}
        </button>
        <button className="flex items-center gap-1">
          <MessageCircle className=' text-blue-600 dark:text-white  dark:hover:fill-white hover:fill-blue-600 duration-500 hover:scale-110 active:scale-95' size={18} /> {post.comments}
        </button>
      </div>
    </div>
  );
}
