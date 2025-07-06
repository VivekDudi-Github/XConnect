import moment from "moment";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus
} from "lucide-react";

export default function NotificationItem({ notification }) {
  const { fromUser, type, post, createdAt, isRead } = notification;

  const getIcon = () => {
    switch (type) {
      case "like":
        return <Heart className="text-pink-500" size={18} />;
      case "comment":
        return <MessageCircle className="text-blue-500" size={18} />;
      case "repost":
        return <Repeat2 className="text-green-500" size={18} />;
      case "follow":
        return <UserPlus className="text-yellow-500" size={18} />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (type) {
      case "like":
        return "liked your post";
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

  return (
    <li className={`flex items-start gap-3 p-4 border rounded-2xl shadow-sm transition-all
        ${!isRead ? " backdrop-blur-lg backdrop-filter" : "bg-white dark:bg-neutral-900"}
        hover:shadow-md`}
    >
      <img
        src={fromUser.avatar}
        alt={'A'}
        className="w-10 h-10 rounded-full object-cover border"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          {getIcon()}
          <Link to={`/profile/${fromUser.username}`} className="font-semibold hover:underline">
            {fromUser.username}
          </Link>
          <span className="text-gray-500">{getMessage()}</span>
          {post && (
            <Link
              to={`/post/${post._id}`}
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
