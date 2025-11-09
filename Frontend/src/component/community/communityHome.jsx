import React , {useState ,useCallback , useRef , useEffect} from 'react'
import CommunityPostCard from './CommunityPostCard';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import CreateCommunityPage from './CreateCommunity';
import { useDispatch, useSelector } from 'react-redux';
import { setIsCreateCommunityDialog } from '../../redux/reducer/miscSlice';
import { useLazyGetCommunityFeedQuery } from '../../redux/api/api';
import lastRefFunc from '../specific/LastRefFunc';
import { EllipsisVerticalIcon } from 'lucide-react';
import SearchBar from '../specific/search/SearchBar';



function CommunityHome() {
  const dispatch = useDispatch();
  const observer = useRef() ;

  
  const [open, setOpen] = useState(false);
  const {iscreateCommunityDialog} = useSelector((state) => state.misc);

  const [communities] = useState([
    { id: 1, name: 'Web Dev', avatar: '🌐' },
    { id: 2, name: 'AI & ML', avatar: '🤖' },
    { id: 3, name: 'Gaming', avatar: '🎮' },
    { id: 4, name: 'Startups', avatar: '🚀' },
  ]);

  const [posts , setPosts] = useState([]) ;

  const [page, setPage] = useState(1);

  const [refetchCommunities, {data , isFetching , isLoading , error ,isError}] = useLazyGetCommunityFeedQuery();


  const lastPostRef = useCallback(node => {
    lastRefFunc({
      observer , 
      node , 
      isLoading , 
      page ,
      activeTab : null ,
      totalPages : null ,
      fetchFunc : refetchCommunities
    })
  } , [refetchCommunities , page , isLoading ]
  )


  useEffect(() =>{ refetchCommunities({page , limit : 2 }) } , [])

  useEffect(() => {
    if(data && data.data){
      setPosts(prev => [...prev , ...data.data]) ;
      setPage(prev => prev + 1)
    }
  } , [data])

  
  useEffect(() => {
    if(isError , error){
      toast.error(error.data.message || 'Something went wrong. Please try again.')
    }
  } , [error , isError])

  // const [posts , setPosts] = useState([
  //    {
  //     _id : 1 ,
  //     community: 'AI & ML',
  //       username: 'neural_guy',
  //       title: 'How do transformers handle long sequences?',
  //       description:
  //         'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
  //       image: [
  //       {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg'} ,
  //       {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg' } , 
  //     ],
  //       time: '2 hours ago',
  //     } ,
  //   {
  //     _id : 2 ,
  //     community: 'AI & ML',
  //     username: 'neural_guy',
  //     title: 'How do transformers handle long sequences?',
  //     description:
  //       'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
  //     image: [],
  //     time: '2 hours ago',
  //   } ,
  //   {
  //     _id : 3 ,
  //     community: 'AI & ML',
  //       username: 'neural_guy',
  //       title: 'How do transformers handle long sequences?',
  //       description:
  //         'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
  //       image: [
  //       {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg'} ,
  //       {url : 'https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg' } , 
  //     ],
  //       time: '2 hours ago',
  //     } ,
  //   {
  //     _id : 4 ,
  //     community: 'AI & ML',
  //     username: 'neural_guy',
  //     title: 'How do transformers handle long sequences?',
  //     description:
  //       'Transformers work well with fixed-size input, but when sequence length increases, performance issues arise. What techniques are used to optimize?',
  //     image: [],
  //     time: '2 hours ago',
  //   } ,
  // ]);

  return (
    
    <div className="w-full p-4 mx-auto sm:px-0 dark:bg-black min-h-screen py-6 rounded-xl dark:text-white">
      <div className=' flex justify-between items-center mb-1'>
        <h1 className="text-2xl font-semibold">Communities</h1>
        <div className='px-2 translate-y-3 lock'><SearchBar/></div>
        <button 
        onClick={() => setOpen((prev) => !prev)}
        className=' rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 active:scale-95 duration-100 sm:hidden block'>
          <EllipsisVerticalIcon size={17} />
        </button>
      </div>
      {/* Dropdown */}
        <div className={`absolute max-h-72 overflow-auto right-2 mt-2 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-2 z-50 duration-200  ${open ? '' : 'scale-0 translate-x-20 -translate-y-32 ' }  `}>
          <button
          onClick={() => dispatch(setIsCreateCommunityDialog(true))}
          className="flex font-semibold items-center justify-center space-x-3 cursor-pointer dark:bg-white text-gray-700 bg-gray-300  dark:text-black active:scale-95 px-3 py-1 rounded-lg duration-100">
            <span>Create a Community</span>
          </button>
          <h4 className="px-2 py-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
            Following Communities
          </h4>
          <ul className="space-y-1">
            {communities.map((community , index) => (
            <Link to={'/communities/c/' + community.id} key={index} >
              <li
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="text-lg">{community.avatar}</span>
                <span className="text-sm font-medium">{community.name}</span>
              </li>
            </Link>
            ))}
          </ul>
        </div>

      <div className='mb-4 h-[1px] bg-gray-500  w-full' />    
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 h-full">

        {/* Main Content */}
        <main className=" sm:col-span-4 space-y-6 pb-8 max-h-screen overflow-y-scroll pr-3">
          {posts.map((post , i) => (
            <div key={post._id} ref={i === posts.length - 1 ? lastPostRef : null}> 
              <CommunityPostCard
                heading={true}
                post={post}
              />
            </div>
          ))}
        </main>
        {/* Sidebar */}
        <aside className="sm:col-span-2 sm:block hidden min-w-24 w-full ">
          <h2 className="text-lg font-medium mb-3">Following</h2>
          <ul className="space-y-3 ">
            {communities.map((comm) => (
              <Link to={'/communities/c/' + comm.id} key={comm.id} >
                <li
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800 px-3 py-2 rounded-lg mb-1  "
                >
                  <span className="text-xl">{comm.avatar}</span>
                  <span>{comm.name}</span>
                </li>
              </Link>
            ))}
          </ul>
          <h2 className="text-lg font-medium mb-3">You may also like</h2>
          <ul className="space-y-3">
            {communities.map((comm) => (
              <Link to={'/communities/c/' + comm.id}  key={comm.id}>
                <li
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800 px-3 py-2 rounded-lg mb-1"
                >
                  <span className="text-xl">{comm.avatar}</span>
                  <span>{comm.name}</span>
                </li>
              </Link>
            ))}
          </ul>
          <hr className='p-[0.5px] mb-1 bg-gray-500 w-full' />
          <button
          onClick={() => dispatch(setIsCreateCommunityDialog(true))}
          className="flex items-center justify-center space-x-3 cursor-pointer dark:bg-white text-gray-700 bg-gray-300  dark:text-black active:scale-95 px-3 py-2 rounded-lg duration-100">
            <span>Create a Community</span>
          </button>
        </aside>
        {iscreateCommunityDialog && (
          <div className='fixed bottom-0 left-0 right-0 h-screen bg-white dark:bg-black p-4 border-t overflow-y-auto  sm:pb-0 pb-16 border-gray-200 dark:border-gray-700 z-50'>
          <CreateCommunityPage/>
        </div>)}
      </div>
    </div>
  );
  
}

export default  CommunityHome