import {BarChart2Icon , MessageCircleIcon , EllipsisVerticalIcon , Share2Icon , BookmarkIcon } from 'lucide-react';
import InPostImages from '../post/InPostImages';


const CommunityPostCard = ({ post , heading }) => {
  const {
    community,
    username,
    title,
    description,
    image,
    time,
  } = post;

  return (
    <div className=' mb-4 scale-100 '>
      {/* Top Info */}
       {heading && (
         <div className=" flex justify-start items-center px-4 ">  
          <span className='text-black font-bold rounded-t-xl bg-black dark:bg-white px-4'>
            <span className="font-e text-xs text-white dark:text-purple-800 overflow-hidden">Posted in {community}</span>            
          </span>
        </div>
       )}
      <div className="bg-white rounded-xl p-2 custom-box"> 
        {/* User Info */}
        <div className="text-xs sm:text-[13px] text-gray-500 mb-2 relative">
          Posted by <span className="text-blue-400">@{username}</span>
           &nbsp; • <span>{time}</span>
           <span className='absolute right-0 top-0 text-xs text-gray-500 '>
            <EllipsisVerticalIcon size={17}/>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-700 dark:text-white mb-2">{title}</h2>

        {/* Description (truncated to ~160 chars) */}
        <p className="text-[13.5px] text-gray-600 font-semibold dark:text-gray-400 mb-3">
          {description?.length > 120 ? `${description.slice(0, 120)}...` : description} 
        </p>

        {/* Optional Image */}
        {image.length > 0 && (
          <div className="mb-3 ">
            <InPostImages imagesArray={[image[0]  ]} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center py-2 border-b border-gray-700 mt-3 text-sm text-gray-400  font-semibold"> 
          <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
           <MessageCircleIcon size={17} /> <span>Comment</span>
          </button>
          <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
           <Share2Icon size={17} className='fill-blue-500 text-blue-500'/> <span>Share</span>
          </button>
          <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
            <BookmarkIcon size={17} className='fill-yellow-500 text-yellow-500' /> <span>Bookmark</span>
          </button>
          <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
            <BarChart2Icon size={17} className=' text-cyan-500 '/><span>Views</span> 
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostCard