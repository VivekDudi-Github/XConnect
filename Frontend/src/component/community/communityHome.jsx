// only create community page for fololowed communities

import React from 'react'

function CommunityHome() {
  const [activeTab, setActiveTab] = React.useState('Chats');
  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:px-0 dark:bg-black  rounded-xl dark:text-white ">
      <h1 className="text-2xl font-semibold mb-4">Communities</h1>
        
      <div className="flex border-b overflow-y-clip overflow-x-auto pb-[2px] ">
        <button
          onClick={() => setActiveTab('Chats')}
          className={`px-3 py-1 -mb-px border-b-2 text-sm hover:scale-110 duration-150  ${
            activeTab === 'Chats'
              ? ' font-bold dark:text-black dark:bg-white rounded-t-xl text-cyan-500 border-b-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab('Groups')}
          className={`px-3 py-1 -mb-px border-b-2 text-sm hover:scale-110 duration-150  ${
            activeTab === 'Groups'
              ? ' font-bold dark:text-black dark:bg-white rounded-t-xl text-cyan-500 border-b-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Groups
        </button>
      </div>
    </div>
  )
}

export default  CommunityHome