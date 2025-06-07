import React from 'react'

import { useState } from 'react';
import PostCard from '../post/PostCard';

const tabs = ['Posts', 'Media' , 'Replies' , 'Likes' , 'History'];

function ProfileTabs() {
  const [activeTab, setActiveTab] = useState('Posts');

  return (
    <div className="mt-8 dark:bg-black bg-white">
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px border-b-2 text-sm hover:scale-110 duration-150  ${
              activeTab === tab
                ? 'border-blue-600  font-bold dark:text-black dark:bg-white rounded-t-xl text-cyan-500 '
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 mx-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <PostCard key={i} />
        ))}
      </div>
    </div>
  );
}


export default ProfileTabs