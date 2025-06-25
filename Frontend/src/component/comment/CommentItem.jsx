import { useState  } from "react";
import {
  ChevronDown,
  Heart,
  Share2Icon,
  ThumbsUp,
} from 'lucide-react';
import RenderPostContent from "../specific/RenderPostContent";

export default function CommentItem({ data, onLike }) {
  const [showReply, setShowReply] = useState(false);
  const [replyInput, setReplyInput] = useState('');

  const handleReply = () => {
    if (!replyInput.trim()) return;
    data.replies.push({
      id: Date.now(),
      user: 'You',
      text: replyInput,
      likes: 0,
      replies: [],
    });
    setReplyInput('');
    setShowReply(false);
  };

  return (
    <div className="border p-3 rounded-lg dark:bg-gradient-to-b dark:from-slate-900 dark:to-black dark:text-white shadow-slate-800/50 shadow-lg border-t border-slate-800/50 duration-200 hover:scale-105">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <img className="size-7 rounded-full" src="./avatar-default.svg" alt="" />
          <div className="text-sm font-medium">{data?.user || 'Anonymous'}</div>
          <div className="text-sm font-medium">@alex</div>
        </div>
        <div className="flex gap-2">
        <span className="text-gray-500 text-sm">3 hours ago.</span>
        <button
          onClick={() => onLike(data._id)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
        >
          <Heart size={14} />
          {data.likes}
        </button>
        <button
          onClick={() => onLike(data._id)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
        >
          <Share2Icon size={14} />
          {}
        </button>
        </div>
      </div>
      <div className="text-sm mt-1">{RenderPostContent(data?.content)}</div>
      <div className="mt-2 flex gap-3 text-xs text-gray-500">
        <button onClick={() => setShowReply(!showReply)} className="flex">
          10 Replies <ChevronDown size={15}/> 
        </button>
      </div>


    </div>
  );
}