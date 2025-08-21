import { EllipsisVerticalIcon, ThumbsUpIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PostViewPage from "../post/MainPost";

function CommunityPostPage() {
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "@john",
      text: "This is a great discussion topic!",
      time: "3h ago",
      likes: 2,
      replies: [
        {
          id: 2,
          user: "@sarah",
          text: "I totally agree with you!",
          time: "2h ago",
          likes: 1,
          replies: [{
          id: 2,
          user: "@sarah",
          text: "I totally agree with you!",
          time: "2h ago",
          likes: 1,
          replies: [{
          id: 2,
          user: "@sarah",
          text: "I totally agree with you!",
          time: "2h ago",
          likes: 1,
          replies: [],
        },],
        },
      ],
        },
      ],
    },
    {
      id: 3,
      user: "@mike",
      text: "I think we should test this idea before implementing.",
      time: "1h ago",
      likes: 0,
      replies: [],
    },
  ]);
  const [communities , setCommunities] = useState([
    { id: 1, name: 'Web Dev', avatar: '🌐' },
    { id: 2, name: 'AI & ML', avatar: '🤖' },
    { id: 3, name: 'Gaming', avatar: '🎮' },
    { id: 4, name: 'Startups', avatar: '🚀' },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), user: "@you", text: newComment, time: "Just now" },
    ]);
    setNewComment("");
  };

  return (
    <div className="min-h-screen dark:bg-[#000] dark:text-white p-6  ">
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 h-full w-full"> 
        <div className="col-span-4 lg:col-span-3"> 
          {/* Post Header */}
          
          <div className="max-w-3xl mx-auto dark:bg-black p-6 rounded-xl border border-gray-200  custom-box ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Posted in <span className="text-indigo-400">XConnect Devs</span> by{" "}
                  <span className="text-white">@vivek</span> • 3h ago
                </p>
                <h1 className="text-2xl font-bold mt-2">
                  How do I improve socket performance in messaging apps?
                </h1>
              </div>
              <img
                src="/community-icon.png"
                alt="Community Icon"
                className="w-12 h-12 rounded-full border border-gray-500"
              />
            </div>

            {/* Post Content */}
            <div className="mt-4 dark:text-gray-300">
              <p>
                I've implemented socket.io for messaging in my MERN app, but I want
                to optimize for lower latency and prevent duplicate messages. Any
                suggestions from experienced devs?
              </p>
              <img
                src="/socket-performance.png"
                alt="Post"
                className="mt-4 rounded-lg max-h-80 w-full object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 mt-6 text-gray-400 text-sm">
              <button>👍 24</button>
              <button>💬 {comments.length}</button>
              <button>🔁 Share</button>
              <button>🔖 Save</button>
            </div>
          </div>

          {/* <div>
            <p className="text-sm text-gray-400">
              Posted in <span className="text-indigo-400">XConnect Devs</span> by{" "}
              <span className="text-white">@vivek</span> • 3h ago
            </p>
            <h1 className="text-2xl font-bold mt-2">
              How do I improve socket performance in messaging apps?
            </h1>
          </div> */}
          <PostViewPage />

          {/* Comment Section */}
          <div className="max-w-full mx-auto mt-6 dark:bg-[#000] p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Comments</h2>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 dark:bg-[#0d1117] shadowLight duration-200 outline-none" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white font-medium"
              >
                Post
              </button>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
              <CommentsThread commentsArr={comments} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className=" col-span-full lg:col-span-1  bg-[#000]"> 
          <div className="bg-[#000] p-6 rounded-xl border-y-2 border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Related Communities</h2>
            <ul className="space-y-3">
              {communities.map((comm) => (
                <li
                  key={comm.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 px-3 py-2 rounded-lg"
                >
                  <span className="text-xl">{comm.avatar}</span>
                  <span>{comm.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityPostPage;



function Comment({ comment, onReply }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <div className="mb-4">
      {/* Comment Content */}
      <div className="dark:bg-[#000] text-black dark:text-white border-t-2 border-gray-700 p-2 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/avatar-default.svg" alt="" className="w-8 h-8 border  rounded-full"/> 
            <Link to={'/profile/'+comment.user} className="text-sm text-gray-400">
              {comment.user} • {comment.time}
            </Link>
          </div>
          <EllipsisVerticalIcon size={17} />
        </div>
        <p className="mt-1">{comment.text}</p>
        <div className="mt-2 text-sm text-gray-500 flex gap-4">
          <button onClick={() => setShowReplyBox(!showReplyBox)}>💬 Reply</button>
          <button className="flex"> <ThumbsUpIcon size={17} /> {' '} {comment.likes}</button> 
        </div>
      </div>

      {/* Reply Box */}
      {showReplyBox && (
        <div className="ml-6 mt-2">
          <textarea
            rows="2"
            placeholder="Write a reply..."
            className="w-full bg-[#161b22] border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          ></textarea>
          <div className="flex gap-2 font-semibold mt-2">
            <button
              onClick={handleReply}
              className="bg-cyan-600  hover:bg-cyan-500 px-4 py-1 rounded text-sm shadowLight" 
            >
              Reply
            </button>
            <button
              onClick={() => setShowReplyBox(false)}
              className="bg-gray-700 hover:bg-gray-500 px-4 py-1 rounded text-sm shadowLight"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Child Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-6 mt-3 border-l border-gray-700 pl-4">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsThread({commentsArr = []}) {
  const [comments, setComments] = useState(commentsArr || []);

  const handleReply = (parentId, replyText) => {
    const newReply = {
      id: Date.now(),
      user: "@you",
      text: replyText,
      time: "Just now",
      likes: 0,
      replies: [],
    };

    const addReply = (list) =>
      list.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...c.replies, newReply] }
          : { ...c, replies: addReply(c.replies) }
      );

    setComments((prev) => addReply(prev));
  };

  return (
    <div className="w-full mx-auto p-6 bg-[#161b22] text-white rounded-xl border border-gray-700  custom-box">

      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onReply={handleReply} />
      ))}
    </div>
  );
}
