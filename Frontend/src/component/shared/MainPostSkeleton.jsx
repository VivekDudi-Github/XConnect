import React from 'react'
import { Share2Icon, Heart , MoreHorizontal , Clock , Bookmark } from 'lucide-react';

function MainPostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 dark:text-white shadow-lg shadow-black/50 rounded-lg animate-pulse">
      {/* Author + Timestamp + Options */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <img
            src='/avatar-default.svg'
            alt='avatar'
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold h-3 w-2/5 bg-gray-600 rounded-lg animate-pulse "> </span>
            <span className="font-semibold h-3 w-24 bg-gray-600 rounded-lg animate-pulse "> </span>
          </div>
        </div>

        {/* Options menu */}
        <div className="relative">
          <button className="text-gray-500 hover:text-black">
            <MoreHorizontal size={20} />
          </button>
          
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-6 whitespace-pre-wrap  leading-relaxed h-4 w-full rounded-lg bg-gray-600 "></div>
      <div className="mt-2 whitespace-pre-wrap  leading-relaxed h-4 w-1/3 rounded-lg bg-gray-600 "></div>
      <div className="mt-2 whitespace-pre-wrap  leading-relaxed h-4 w-1/3 rounded-lg bg-gray-600 "></div>

        <div className="mt-4 flex gap-2 items-center">
          <div className='h-16 w-1/2 bg-gray-600 rounded-lg' />
          <div className='h-16 w-1/2 bg-gray-600 rounded-lg ' />
        </div>
   

      {/* Actions */}
      <div className="mt-6 flex items-center gap-6 text-gray-600 text-sm">
        <button className={`flex items-center gap-`}>
          <Heart size={16} />
          
        </button>

        <button className="flex items-center gap-1">
          <Share2Icon size={16} />
        </button>

        <button
          className={`flex items-center gap-1 `}
        >
          <Bookmark size={16} />
          Save
        </button>
      </div>

    </div>
  )
}

export default MainPostSkeleton