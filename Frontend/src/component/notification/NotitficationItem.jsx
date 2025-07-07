import moment from "moment";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus
} from "lucide-react";

export default function NotificationItem({ notification }) {
  const { sender, type, post, createdAt, isRead , comment_Id } = notification;

  const getIcon = () => {
    switch (type) {
      case "like":
        return <Heart className="fill-pink-500 text-pink-500" size={18} />;
      case "comment":
        return <MessageCircle className="fill-blue-500 text-blue-500 " size={18} />;
      case "repost":
        return <Repeat2 className="fill-green-500  text-green-500" size={18} />;
      case "follow":
        return <UserPlus className="fill-yellow-500  text-yellow-500"    size={18} />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (type) {
      case "like":
        return "liked your post";
      case "mention":
        return `mentioned you in a ${comment_Id ? 'comment' : 'post'}`;
      case "comment":
        return "commented on your post";
      case "repost":
        return "reposted your post";
      case "follow":
        return "started following you";
      default:
        return "sent a notification";
    }
  };

  const getLink = () => {
    if( comment_Id) return `/post/${post}/?comment_Id=${comment_Id}` ;
    return `/post/${post}` ;
  }

  return (
    <li className={`flex items-start gap-3 p-4 border rounded-2xl transition-all shadow-lg shadow-slate-400 dark:shadow-slate-800 
        ${isRead ? "opacity-70 backdrop-blur-lg backdrop-filter" : "bg-white dark:bg-neutral-900"}`}
    >
      <img
        src={sender?.avatar?.url}
        alt={'A'}
        className="w-10 h-10 rounded-full object-cover border"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Link to={`/profile/${sender.username}`} className="font-semibold hover:underline">
            {sender.username}
          </Link>
          {getIcon()}
          <span className="text-gray-500">{getMessage()}</span>
          {post && (
            <Link
              to={getLink()}
              className="ml-auto text-blue-500 text-xs hover:underline"
            >
              View Post
            </Link>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {moment(createdAt).fromNow()} ago
        </div>
      </div>
    </li>
  );
}
