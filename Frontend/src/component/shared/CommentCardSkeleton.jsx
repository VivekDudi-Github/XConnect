import React from 'react'
import { Share2Icon , Heart } from 'lucide-react'

function CommentCardSkeleton() {
  return (
    <div className="border p-3 animate-pulse rounded-lg dark:bg-gradient-to-b dark:from-slate-900 dark:to-black dark:text-white shadow-slate-800/50 shadow-lg border-t border-slate-800/50 duration-200 hover:scale-105">
    <div className="flex justify-between items-center">
      <div className="flex gap-2 w-1/2 rounded-md">
        <img className="size-7 rounded-full " src="/avatar-default.svg" alt="" />
        <div className="w-2/5 h-4 bg-slate-500 rounded-md"></div>
        <div className="w-1/5 h-4 bg-slate-600 rounded-md"></div>
      </div>
      <div className="flex gap-2 ">
      <span className="w-1/6 h-10 bg-slate-500 rounded-md"></span>
      <button
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 rounded-md"
      >
        <Heart size={14} />
      </button>
      <button
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 rounded-md"
      >
        <Share2Icon size={14} />
      </button>
      </div>
    </div>
    <div className="bg-slate-500 w-3/5 h-5 rounded-md"></div>
    <div className="mt-2 w-1/6 h-4 rounded-lg bg-slate-500" />


  </div>
  )
}

export default CommentCardSkeleton