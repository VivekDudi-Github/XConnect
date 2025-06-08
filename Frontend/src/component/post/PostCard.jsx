import { Heart, MessageCircle } from 'lucide-react';
import InPostImages from './InPostImages';

export default function PostCard({ post }) {
  
  return (
    <div className="bg-white rounded-xl dark:shadow-sm p-4 mb-4 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black dark:text-white shadow-slate-800/50 shadow-lg border-t border-slate-800/50 ">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post.avatar}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{post.username}</p>
          <span className="text-xs text-gray-500">{post.timestamp}</span>
        </div>
      </div>

      {/* Content */}
      <p className="dark:text-gray-300 mb-2">{post.content}</p>

      {/* Image */}
      {/* {post.images && post.images.length > 0 && (
        <InPostImages imagesArray={post.image}/>
      )} */}

      {/* Actions */}
      <div className="flex gap-6 text-sm text-gray-600 mt-2">
        <button className="flex items-center gap-1 hover:text-pink-600">
          <Heart size={18} /> {post.likes}
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <MessageCircle size={18} /> {post.comments}
        </button>
      </div>
    </div>
  );
}
