import { HeartIcon , MessageCircle } from 'lucide-react'
import React from 'react'

function PostCardSkeleton() {
  return (
    <div className='bg-white w-full mx-auto relative rounded-xl dark:shadow-sm p-4 mb-4 dark:bg-black dark:border-t dark:border-white -gradient-to-b dark:from-gray-800 dark:to-black dark:text-white shadow-slate-800/50 shadow-lg border-t border-slate-800/50 duration-200 break-inside-avoid  animate-pulse '>
      <div className="flex items-center gap-3 mb-2">
        <img
          src='/avatar-default.svg'
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover "
        />
        <div>
          <h2 className="font-semibold">
          <div className='text-sm text-gray-500 hover:text-blue-400 h-4 w-24 bg-gray-600 rounded-lg '>  </div>
          </h2>
          <span className="text-xs text-gray-500">
          </span>
        </div>
      </div>
    

      {/* Content */}
      <pre className="dark:text-gray-300 mb-2 font-sans text-wrap animate-pulse">
        <div className='h-4 w-1/2 bg-gray-600 rounded-lg' />
        <div className='h-4 w-1/3 bg-gray-600 rounded-lg mt-2' />
      
      </pre>


      {/* Actions */}
      <div className="flex gap-6 text-sm text-gray-600 mt-2">
        <button 
        className="flex items-center gap-1" 
        >
          <HeartIcon 
          className={ ` text-pink-600  dark:hover:fill-white fill-pink-600 duration-500 hover:scale-110 active:scale-95 `} 
          size={18} />
        </button>

        <button className="flex items-center gap-1">
          <MessageCircle className=' text-blue-600 dark:text-white  fill-white hover:fill-blue-600 duration-500 hover:scale-110 active:scale-95' size={18} /> 

        </button>
      </div>
    </div>
   
  )
}

export default PostCardSkeleton