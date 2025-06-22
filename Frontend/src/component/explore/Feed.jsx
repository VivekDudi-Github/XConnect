import {useState} from 'react'
import PostCard from '../post/PostCard'

import { dummyPosts } from '../../sampleData'

const TABS = ["All", "Following", "Communities", "Media"]
function Feed() {
  const [activeTab, setActiveTab] = useState("All");

  


  
  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:px-0">
      <h1 className="text-2xl font-semibold mb-4">Your Feed</h1>

      <div className="flex gap-4 border-b pb-2 mb-4 overflow-x-auto ml-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {dummyPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>

  )
}

export default Feed