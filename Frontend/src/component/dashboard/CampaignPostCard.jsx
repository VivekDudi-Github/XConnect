import { EllipsisVerticalIcon, PinIcon , Heart, MessageCircle, BarChart2Icon } from 'lucide-react';
import React from 'react'
import { useSelector } from 'react-redux'
import InPostImages from '../post/InPostImages';
import RenderPostContent from '../specific/RenderPostContent';
import moment from 'moment';

function CampaignDummyPostCard({post }) {
  const {user} = useSelector(state => state.auth) ;
  console.log(post.media);
  
  return (
    <article className="bg-white w-full mx-auto relative rounded-xl dark:shadow-sm p-2 mb-4 dark:bg-black  dark:from-slate-900 dark:to-black dark:text-white shadow-slate-400 shadow-lg border-t dark:border-y dark:border-white dark:border-b-gray-600 border-slate-800/50 duration-200 break-inside-avoid  ">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2 pr-7">
        <div className='flex justify-between gap-2'>
          <div>
            <img
              src={user.avatar?.url || '/avatar-default.svg'}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover "
            />
          </div>
          <div>
            <h2 className="font-semibold">{user.fullname}
            <div className='text-sm text-gray-500 hover:text-blue-400'> @{user.username} </div>
            </h2>
          </div>
        </div>

      </div>

      <div className=' absolute top-4 right-2 dark:hover:bg-slate-700 hover:bg-gray-300 rounded-full p-2 duration-200'>
        {/* Options */}
        <EllipsisVerticalIcon size={17}/>
      </div>

      {/* Content */}
      <div className={` overflow-hidden transition-[max-height] duration-1000 ease-in-out `}>
        <pre  className="dark:text-gray-300 mb-2 font-sans text-wrap"><RenderPostContent text={post?.content}/></pre>
      </div>

      {/* Image */}
      {post?.media && post.media.length > 0 && (
        <InPostImages imagesArray={post.media}/>
      )}

      {/* Actions */}
      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
        <div className='flex gap-2 items-center'>
          <button className="flex items-center gap-1" >
            <Heart 
            className={ ` text-pink-600  dark:hover:fill-white hover:fill-pink-600 duration-500 hover:scale-110 active:scale-95  fill-pink-600 `} 
            size={18} /> 
            12k
          </button>

          <div  className="flex items-center gap-1">
            <MessageCircle className=' text-blue-600 dark:text-white  dark:hover:fill-white hover:fill-blue-600 duration-500 hover:scale-110 active:scale-95' size={18} /> 
            1.7k
          </div>
          <span className="flex items-center gap">
            <BarChart2Icon size={17} className=' text-cyan-500 '/> 
            59k
          </span>
          
        </div>
        <span className="text-xs text-gray-500">
            • {moment(Date.now()).fromNow()}
        </span>
      </div>
    </article>
  )
}

export default CampaignDummyPostCard