import { useEffect, useState } from 'react';
import CreateCommunityPost from './CreateCommunityPost';
import CreateCommunityPage from './CreateCommunity';
import CommunityPostCard from './CommunityPostCard';
import { useDispatch, useSelector } from 'react-redux';
import { setIsCreateCommunityDialog, setIsCreateCommunityPostDialog } from '../../redux/reducer/miscSlice';
import { useParams } from 'react-router-dom';
import { useGetACommunityQuery, useToggleFollowCommunityMutation } from '../../redux/api/api';
import { toast } from 'react-toastify';

//add community follow , unfollow , get community posts , update communiyt profile , delete community , tabs in community home page , pins and highlightz ,
export default function CommunityHomePage() {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth) ;

  const {id} = useParams();
  
  const {iscreateCommunityDialog , isCreateCommunityPostDialog} = useSelector(state => state.misc );
  const [followCommunityMutation ,] = useToggleFollowCommunityMutation() ;


  const {data , isLoading , isError , error } = useGetACommunityQuery({id} , {skip : !id}) ;

  const [community , setCommunity] = useState(null) ;
  const [isFollowing , setIsFollowing] = useState(false) ;
  const [posts , setPosts] = useState([]);

  console.log(community, data);

  const toggleFollowCommunity = async() => {
    try {
      const res = await followCommunityMutation({id : community?._id}).unwrap() ;
      res.data.data.operation === true ? setIsFollowing(true) : setIsFollowing(false) ;
    } catch (error) {
      console.log(error);
      toast.error(error.data.message || 'Something went wrong. Please try again.')
    }
  }

  useEffect(() => {
    if(data?.data){
      setCommunity(data.data);
    }
  } , [data]) ;

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white text-black sm:pb-0 pb-16 "> 
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 h-48 flex items-center px-6 mb-6">
      <img src={community?.banner?.url} alt="Community Icon" className="object-cover absolute top-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 h-full w-full z-0"/>
        <img
          src="/XConnect.jpeg"
          alt="Community Icon"
          className="w-20 h-20 rounded-full border-4 border-white shadow-md z-10"
        />
        <div className="ml-4 z-10">
          <h1 className="text-3xl font-bold ">{community?.name}</h1>
          <p className="text-sm opacity-80">Building the future of social</p>
        </div>
        <div className='ml-auto flex gap-2 z-10'>
          
          {community?.isFollowing ? (
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

      {/* Right: Sidebar */}
        <div className= " dark:text-white p-4 rounded-xl space-y-4 h-fit custom-box ">
          <div>
            <h3 className="text-lg font-bold mb-2">About Community</h3>
            <p className="text-sm dark:text-gray-300">
              {community?.description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Community Stats</h3>
            <ul className="text-sm text-gray-400">
              <li>👥 {community?.totalFollowers} { community?.totalFollowers > 1 ? 'Members' : 'Member'}</li>
              <li>🟢 142 Online</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Rules</h3>
            <ul className="text-sm text-red-400 list-disc ml-5 space-y-1">
              {community?.rules.map((rule , index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
          {community?.isFollowing && community?.creator !== user?._id && (
            <button 
            onClick={() => setJoined(false)}
            className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white active:bg-red-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200"> 
              Unfollow
            </button>
          )}
          {community?.creator === user?._id && ( 
            <button 
            onClick={() => dispatch(setIsCreateCommunityDialog(true))}
            className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white active:bg-red-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200"> 
              Update Community
            </button>
          )}
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
      </div>

      {/* Create Post */}
      { isCreateCommunityPostDialog && (
        <div className='fixed bottom-0 left-0 right-0 min-h-screen bg-white dark:bg-black p-4 border-t overflow-y-auto border-gray-200 dark:border-gray-700 z-50'>
          <CreateCommunityPost /> 
        </div>
      )}
      { iscreateCommunityDialog && (
        <div className='fixed bottom-0 left-0 right-0 min-h-screen bg-white dark:bg-black p-4 border-t overflow-y-auto border-gray-200 dark:border-gray-700 z-50'>
          <CreateCommunityPage community={community} isUpdate={true} /> 
        </div>
      ) }
    </div>
  );
}
