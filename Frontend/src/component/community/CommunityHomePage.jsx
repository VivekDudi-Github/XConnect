import { useState } from 'react';
import CreateCommunityPost from './CreateCommunityPost';
import CreateCommunityPage from './CreateCommunity';
import CommunityPostCard from './CommunityPostCard';
import { useDispatch, useSelector } from 'react-redux';
import { setIsCreateCommunityPostDialog } from '../../redux/reducer/miscSlice';

export default function CommunityHomePage() {
  const dispatch = useDispatch();

  const {iscreateCommunityDialog , isCreateCommunityPostDialog} = useSelector(state => state.misc );


  const [joined, setJoined] = useState(false);
  const [posts , setPosts] = useState([
       {
        _id : 1 ,
        community: 'AI & ML',
        communityId : '12345',
          author: {
            username: 'neural_guy',
          },
          title: 'How do transformers handle long sequences?',
          content:
            'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
          media: [
          {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg'} ,
          {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg' } , 
        ],
          createdAt: '2025-08-17T16:36:31.996Z',
        } ,
        {
        _id : 3 ,
        community: 'AI & ML',
        communityId : '12345',
          author: {
            username: 'neural_guy',
          },
          title: 'How do transformers handle long sequences?',
          content:
            'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
          media: [
          {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg'} ,
          {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg' } , 
        ],
          createdAt: '2025-08-17T16:36:31.996Z',
        } ,
        {
        _id : 2 ,
        community: 'AI & ML',
        communityId : '12345',
          author: {
            username: 'neural_guy',
          },
          title: 'How do transformers handle long sequences?',
          content:
            'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
          media: [
          {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg'} ,
          {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg' } , 
        ],
          createdAt: '2025-08-17T16:36:31.996Z',
        } ,
      
    ]);

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
        <div className='ml-auto flex gap-2'>
          {/* <button
            onClick={() => setJoined(!joined)}
            className="ml-auto bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
          >
            Create Post
          </button> */}
          {joined ? (
            <button
              onClick={() => {dispatch(setIsCreateCommunityPostDialog(true))}}
              className="ml-auto bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Create Post
            </button>
          ) : (
            <button
              onClick={() => setJoined(!joined)}
              className="ml-auto bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Join
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {/* Left: Posts */}
        <div className="md:col-span-3 space-y-4">
          {posts.map((post) => (
            <CommunityPostCard
              key={post._id}
              post={post} 
              heading={false}
            />
          ))}
        </div>

        {/* Right: Sidebar */}
        <div className= " dark:text-white p-4 rounded-xl space-y-4 h-fit custom-box ">
          <div>
            <h3 className="text-lg font-bold mb-2">About Community</h3>
            <p className="text-sm dark:text-gray-300">
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
          {joined && (
            <button 
            onClick={() => setJoined(false)}
            className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white active:bg-red-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200"> 
              Leave
            </button>


          )}
        </div>
      </div>

      {/* Create Post */}
      { isCreateCommunityPostDialog && <CreateCommunityPost /> }
      { iscreateCommunityDialog && <CreateCommunityPage /> }
    </div>
  );
}
