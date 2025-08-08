import { useState } from 'react';
import CreateCommunityPost from './CreateCommunityPost';
import CreateCommunityPage from './CreateCommunity';

export default function CommunityHomePage() {
  const [joined, setJoined] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white text-black"> 
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 h-48 flex items-center px-6">
        <img
          src="/XConnect.jpeg"
          alt="Community Icon"
          className="w-20 h-20 rounded-full border-4 border-white shadow-md"
        />
        <div className="ml-4">
          <h1 className="text-3xl font-bold">XConnect Devs</h1>
          <p className="text-sm opacity-80">Building the future of social</p>
        </div>
        <button
          onClick={() => setJoined(!joined)}
          className="ml-auto bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
        >
          {joined ? 'Leave' : 'Join'}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {/* Left: Posts */}
        <div className="md:col-span-3 space-y-4">
          {/* Single Post Card */}
          <div className="bg-[#161b22] p-4 rounded-xl border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">
              Posted in <span className="text-indigo-400">#general</span> by <span className="text-white">@vivek</span>
            </div>
            <h2 className="text-lg font-semibold">How do I optimize socket performance for messaging?</h2>
            <p className="text-sm text-gray-300 mt-1">
              I’ve implemented socket.io in my MERN stack app. I want to improve latency and avoid redundant fetches...
            </p>
            {true && ( // Optional image
              <img
                src="/socket-performance.png"
                alt="Post Image"
                className="mt-2 rounded-lg max-h-60 object-cover w-full"
              />
            )}
            <div className="flex items-center gap-4 mt-3 text-gray-400 text-sm">
              <button>💬 5</button>
              <button>🔁 Share</button>
              <button>🔖 Bookmark</button>
            </div>
          </div>
          {/* Add more posts below in similar fashion */}
        </div>

        {/* Right: Sidebar */}
        <div className="bg-[#161b22] p-4 rounded-xl border border-gray-700 space-y-4">
          <div>
            <h3 className="text-lg font-bold mb-2">About Community</h3>
            <p className="text-sm text-gray-300">
              XConnect Devs is a space for developers working on the XConnect platform. Share ideas, bugs, and improvements.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Community Stats</h3>
            <ul className="text-sm text-gray-400">
              <li>👥 2,134 Members</li>
              <li>🟢 142 Online</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Rules</h3>
            <ul className="text-sm text-red-400 list-disc ml-5 space-y-1">
              <li>No spam or self-promotion</li>
              <li>Stay respectful</li>
              <li>Keep discussions relevant</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Post */}
      <CreateCommunityPage />
    </div>
  );
}
