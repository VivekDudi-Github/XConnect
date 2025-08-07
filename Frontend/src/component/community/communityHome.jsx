import React , {useState} from 'react'
import CommunityPostCard from './CommunityPostCard';


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
      _id : 1 ,
      community: 'AI & ML',
        username: 'neural_guy',
        title: 'How do transformers handle long sequences?',
        description:
          'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
        image: [
        {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg'} ,
        {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg' } , 
      ],
        time: '2 hours ago',
      } ,
    {
      _id : 2 ,
      community: 'AI & ML',
      username: 'neural_guy',
      title: 'How do transformers handle long sequences?',
      description:
        'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
      image: [],
      time: '2 hours ago',
    } ,
    {
      _id : 1 ,
      community: 'AI & ML',
        username: 'neural_guy',
        title: 'How do transformers handle long sequences?',
        description:
          'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
        image: [
        {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg'} ,
        {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg' } , 
      ],
        time: '2 hours ago',
      } ,
    {
      _id : 2 ,
      community: 'AI & ML',
      username: 'neural_guy',
      title: 'How do transformers handle long sequences?',
      description:
        'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
      image: [],
      time: '2 hours ago',
    } ,
  ]);

  return (
    
    <div className="max-w-5xl mx-auto mt-4 px-2 sm:px-0 dark:bg-black min-h-screen py-6 rounded-xl dark:text-white">
      <h1 className="text-2xl font-semibold mb-6">Communities</h1>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 h-full">

        {/* Main Content */}
        <main className=" sm:col-span-4 space-y-6 pb-8 max-h-screen overflow-y-scroll pr-3">
          {posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
            />
          ))}
        </main>
        {/* Sidebar */}
        <aside className="sm:col-span-2 sm:block hidden min-w-24 w-full">
          <h2 className="text-lg font-medium mb-3">Following</h2>
          <ul className="space-y-3 ">
            {communities.map((comm) => (
              <li
                key={comm.id}
                className="flex items-center  space-x-3 cursor-pointer hover:bg-gray-800 px-3 py-2 rounded-lg"
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

// const CommunityPostCard = ({ post }) => {
//   const {
//     community,
//     username,
//     title,
//     description,
//     image,
//     time,
//   } = post;

//   return (
//     <div className=' mb-4 scale-100 '>
//       {/* Top Info */}
//         <div className=" flex justify-start items-center px-4 ">  
//           <span className='text-black font-bold rounded-t-xl bg-black dark:bg-white px-4'>
//             <span className="font-e text-xs text-white dark:text-purple-800 overflow-hidden">Posted in {community}</span>            
//           </span>
//         </div>
//       <div className="bg-white rounded-xl p-2 dark:shadow-sm dark:bg-black  dark:from-slate-900 dark:to-black dark:text-white shadow-slate-400 shadow-lg border-t dark:border-y dark:border-white dark:border-b-gray-600 border-slate-800/50 duration-200"> 
//         {/* User Info */}
//         <div className="text-xs sm:text-[13px] text-gray-500 mb-2 relative">
//           Posted by <span className="text-blue-400">@{username}</span>
//            &nbsp; • <span>{time}</span>
//            <span className='absolute right-0 top-0 text-xs text-gray-500 '>
//             <EllipsisVerticalIcon size={17}/>
//           </span>
//         </div>

//         {/* Title */}
//         <h2 className="text-lg font-bold text-gray-700 dark:text-white mb-2">{title}</h2>

//         {/* Description (truncated to ~160 chars) */}
//         <p className="text-[13.5px] text-gray-600 font-semibold dark:text-gray-400 mb-3">
//           {description.length > 120 ? `${description.slice(0, 120)}...` : description} 
//         </p>

//         {/* Optional Image */}
//         {image.length > 0 && (
//           <div className="mb-3 ">
//             <InPostImages imagesArray={[image[0]  ]} />
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex justify-between items-center py-2 border-b border-gray-700 mt-3 text-sm text-gray-400  font-semibold"> 
//           <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
//            <MessageCircleIcon size={17} /> <span>Comment</span>
//           </button>
//           <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
//            <Share2Icon size={17} className='fill-blue-500 text-blue-500'/> <span>Share</span>
//           </button>
//           <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
//             <BookmarkIcon size={17} className='fill-yellow-500 text-yellow-500' /> <span>Bookmark</span>
//           </button>
//           <button className="dark:hover:text-white hover:text-gray-800 flex items-center gap-1 duration-200">
//             <BarChart2Icon size={17} className=' text-cyan-500 '/><span>Views</span> 
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };