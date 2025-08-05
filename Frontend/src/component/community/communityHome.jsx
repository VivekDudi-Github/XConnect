import React , {useState} from 'react'
import {ArrowUpIcon , ArrowDownIcon , MessageCircleDashedIcon , Share2Icon , BookMarkedIcon } from 'lucide-react';

function CommunityHome() {
  const [activeTab, setActiveTab] = React.useState('Chats');
  const [communities] = useState([
    { id: 1, name: 'Web Dev', avatar: '🌐' },
    { id: 2, name: 'AI & ML', avatar: '🤖' },
    { id: 3, name: 'Gaming', avatar: '🎮' },
    { id: 4, name: 'Startups', avatar: '🚀' },
  ]);

  const [posts] = useState([
     {
      id: 1,
      community: 'Web Dev',
      user: 'john_doe',
      content: 'React 19 is out! Have you tried the new use() hook?',
      time: '2 hours ago',
    },
    {
      id: 2,
      community: 'AI & ML',
      user: 'ai_nerd',
      content: 'Transformers are revolutionizing NLP. Thoughts?',
      time: '5 hours ago',
    },
  ]);

  return (
    
    <div className="max-w-5xl mx-auto mt-4 px-2 sm:px-0 dark:bg-black min-h-screen py-6 rounded-xl dark:text-white">
      <h1 className="text-2xl font-semibold mb-6">Communities</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        

        {/* Main Content */}
        <main className="sm:col-span-3 space-y-6">
          <CommunityPostCard
            post={{
              community: 'AI & ML',
              username: 'neural_guy',
              title: 'How do transformers handle long sequences?',
              description:
                'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
              image: 'https://source.unsplash.com/random/800x400?ai',
              time: '2 hours ago',
            }}
          />
        </main>
        {/* Sidebar */}
        <aside className="sm:col-span-1 min-w-32">
          <h2 className="text-lg font-medium mb-3">Following</h2>
          <ul className="space-y-3 ">
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
          <h2 className="text-lg font-medium mb-3">You may also like</h2>
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
        </aside>
      </div>
    </div>
  );
  
}

export default  CommunityHome

const CommunityPostCard = ({ post }) => {
  const {
    community,
    username,
    title,
    description,
    image,
    time,
  } = post;

  return (
    <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-700 text-white shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Top Info */}
      <div className="text-sm text-gray-400 flex justify-between items-center mb-1">
        <span className="font-medium text-purple-400">Posted in {community}</span>
        <span>{time}</span>
      </div>

      {/* User Info */}
      <div className="text-sm text-gray-500 mb-2">
        Posted by <span className="text-blue-400">@{username}</span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>

      {/* Description (truncated to ~160 chars) */}
      <p className="text-sm text-gray-300 mb-3">
        {description.length > 160 ? `${description.slice(0, 160)}...` : description}
      </p>

      {/* Optional Image */}
      {image && (
        <div className="mb-3">
          <img
            src={image}
            alt="Post visual"
            className="w-full rounded-md max-h-64 object-cover border border-gray-800"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-3 text-sm text-gray-400">
        <button className="hover:text-white flex items-center gap-1">
          💬 <span>Comment</span>
        </button>
        <button className="hover:text-white flex items-center gap-1">
          🔗 <span>Share</span>
        </button>
        <button className="hover:text-white flex items-center gap-1">
          🔖 <span>Bookmark</span>
        </button>
      </div>
    </div>
  );
};