import { useCallback, useEffect, useRef, useState } from 'react';
import CreateCommunityPost from './CreateCommunityPost';
import CreateCommunityPage from './CreateCommunity';
import CommunityPostCard from './CommunityPostCard';
import { useDispatch, useSelector } from 'react-redux';
import { setIsCreateCommunityDialog, setIsCreateCommunityPostDialog } from '../../redux/reducer/miscSlice';
import { useLocation, useNavigate,  useParams } from 'react-router-dom';
import { useDeleteCommunityMutation, useGetACommunityQuery,  useLazyGetCommunityIsInvitedQuery, useLazyGetCommunityPostsQuery, useToggleFollowCommunityMutation, useToggleJoinModMutation } from '../../redux/api/api';
import { toast } from 'react-toastify';
import lastRefFunc from '../specific/LastRefFunc';
import DialogBox from '../shared/DialogBox';
import { Search } from 'lucide-react';
import SearchBar from '../specific/search/SearchBar';
import InviteMods from './InviteMods';

const tabs = ['General' , 'Help' ,'FeedBack' , 'Highlights'];  

//tabs in community home page , pins and highlights ,
export default function CommunityHomePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const invite = params.get("invite");


  const navigate = useNavigate() ;
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth) ;

  const {id} = useParams();
  const observer = useRef(null) ;

  const [addModsBox , setAddModsBox] = useState(false) ;
  const [activeTab , setActiveTab] = useState('General');

  const [deleteCommunityDialog , setDeleteCommunityDialog] = useState(false) ;

  const {iscreateCommunityDialog , isCreateCommunityPostDialog} = useSelector(state => state.misc );
  const [followCommunityMutation ,] = useToggleFollowCommunityMutation() ;
  const [deleteCommunityMutation] = useDeleteCommunityMutation() ;

  const [page , setPage] = useState(1);
  const [totalPages , setTotalPages] = useState(1);

  const {data , isLoading , isError , error } = useGetACommunityQuery({id} , {skip : !id}) ;
  const [fetchIsInvite , {data : inviteData}] = useLazyGetCommunityIsInvitedQuery({id}) ;
  const [joinModMutation] = useToggleJoinModMutation() ;

  const [community , setCommunity] = useState(null) ;
  const [isFollowing , setIsFollowing] = useState(false) ;
  const [posts , setPosts] = useState([]);



  const [ fetchMorePost ,{data : communityPosts , isLoading : isLoadingPosts , isError : isErrorPosts , error : errorPosts}] = useLazyGetCommunityPostsQuery() ;

  const lastPostRef = useCallback(node => {
      lastRefFunc({
        observer , 
        node , 
        isLoading : isLoadingPosts , 
        page ,
        id ,
        activeTab ,
        totalPages ,
        fetchFunc : fetchMorePost ,
      })
    } , [fetchMorePost , page , activeTab , isLoadingPosts ,totalPages ]
  )

useEffect(() => {
  setPage(1);
  setPosts([]) ;
  setTotalPages(1);
  
  fetchMorePost({page : 1 , tab : activeTab , id}) ; 
  
}, [activeTab])

  useEffect(() => {
    if(communityPosts && communityPosts?.data){
      console.log(communityPosts);
      
      setPosts(prev => [...prev , ...communityPosts.data.posts]) ;
      setTotalPages(communityPosts.data.totalPages) ;
      if(communityPosts.data.totalPages > page) setPage(prev => prev + 1) ;
    }
  } , [communityPosts])

  useEffect(() => {
    if(isErrorPosts && error){
      toast.error(`Error fetching posts: ${errorPosts.data.message || 'Something went wrong while fetching posts.'}`) ;
      console.error('Error fetching posts:', errorPosts);
    }
  } , [isErrorPosts]) ;

  const toggleFollowCommunity = async(e) => {
    e.preventDefault();
    try {
      const res = await followCommunityMutation({id : community?._id}).unwrap() ;
      res?.data?.operation === true ? setIsFollowing(true) : setIsFollowing(false) ;
    } catch (error) {
      console.log(error);
      toast.error(error.data.message || 'Something went wrong. Please try again.') ;
    }
  }

  const deleteCommunityFunc = async() => {

    // try {
    //   const res = await deleteCommunityMutation(community?._id).unwrap() ;
    //   res.data.data.operation === true ? setDeleteCommunity(false) : setDeleteCommunity(true) ;
    // } catch (error) {
    //   console.log(error);
    //   toast.error(error.data.message || 'Something went wrong. Please try again.') ;
    // }
  }

  useEffect(() => {
    if(invite === 'true' && id){
      console.log('fetched mod invite');
      
      fetchIsInvite({id}) ;
    }
  } , [invite]) ;

  useEffect(() => {
    if(data?.data){
      setCommunity(data.data);
      setIsFollowing(data.data.isFollowing);
    }
  } , [data]) ;

  const toggleJoinMod = async() => {
    try {
      await joinModMutation({id : community?._id}).unwrap() ;
      console.log('join mod mutated');
      navigate(0)
    } catch (error) {
      console.log(error);
      toast.error(error.data.message || 'Something went wrong. Please try again.') ;
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white text-black sm:pb-0 pb-16 "> 
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 h-48 flex items-center px-6 mb-6">
      <img src={community?.banner?.url ?? community?.avatar?.url } alt="Community Icon" className="object-cover absolute top-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 h-full w-full z-0"/>
        <img
          src={community?.avatar?.url}
          alt="Community Icon"
          className="w-20 h-20 rounded-full border-4 border-white shadow-md z-10"
        />
        <div className="ml-4 z-10">
          <h1 className="text-3xl font-bold sm:block hidden ">{community?.name}</h1>
          <p className="text-sm opacity-80 sm:block hidden">{community?.tagline ?? 'Building the future of social'}</p>
        </div>
        <div className='ml-auto flex gap-2 z-10'>
          
          {isFollowing ? (
            <button
              onClick={() => {dispatch(setIsCreateCommunityPostDialog(true))}}
              className="ml-auto bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Create Post
            </button>
          ) : (
            <button
              onClick={toggleFollowCommunity}
              className="ml-auto bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Join
            </button>
          )}
        </div>
      </div>

      <div className='px-2'><SearchBar/></div>
      {/* Tabs */}
      <div className=" mx-2 flex borde overflow-y-clip overflow-x-auto pb-1 ">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab) ;
              setPosts([]) ;
            }}
            className={`px-4 py-2 -mb-px border-b-2 text-sm hover:scale-110 duration-150  ${
              activeTab === tab
                ? 'border-blue-600  font-bold dark:text-black dark:bg-white rounded-t-xl text-cyan-500 '
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* about community */}
      <div className= " dark:text-white p-4 rounded-xl space-y-4 h-fit custom-box ">
        <div>
          <h3 className="text-lg font-bold mb-2">About Community</h3>
          <p className="text-sm dark:text-gray-300">
            {community?.description}
          </p>
        </div>
        {/* bio */}
        <div>
          <h3 className="text-lg font-bold mb-2">Community Stats</h3>
          <ul className="text-sm text-gray-400">
            <li>👥 {community?.totalFollowers} { community?.totalFollowers > 1 ? 'Members' : 'Member'}</li>
            <li>🟢 142 Online</li>
            <li>👤 5 Moderators</li>
          </ul>
        </div>
        {/* rules */}
        <div>
          <h3 className="text-lg font-bold mb-2">Rules</h3>
          <ul className="text-sm text-red-400 list-disc ml-5 space-y-1">
            {community?.rules.map((rule , index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>
        {isFollowing && community?.creator !== user?._id && (
          <button 
          onClick={toggleFollowCommunity}
          className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white active:bg-red-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200"> 
            Unfollow
          </button>
        )}
        {community?.creator == user?._id && (
          <>
            <button 
            onClick={() => dispatch(setIsCreateCommunityDialog(true))}
            className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white active:bg-red-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200"> 
              Edit Community
            </button>
            <button
              onClick={() => setDeleteCommunityDialog(true)}
              className="border-2 ml-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white active:bg-red-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200"
            >
              Delete Community
            </button>
            <button
              onClick={() => setAddModsBox(true)}
              className="border-2 ml-1 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white active:bg-purple-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200"
            >
              Invite new moderator
            </button>
          </>
        )}
        {inviteData?.data.isInvited === true && 
        <button onClick={toggleJoinMod}
          className="border-2 ml-1 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white active:bg-red-700 font-medium px-5 py-1 rounded-lg shadow-md active:scale-95 duration-200">
            Join as Moderator
        </button>}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {/* Left: Posts */}
        <div className="md:col-span-3 space-y-4">
          {posts.map((post  , i) => (
            <div key={post._id} ref={ i === posts.length - 1 ? lastPostRef : null } >
              <CommunityPostCard
              post={post} 
              heading={false}
            />
            </div>
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
      {deleteCommunityDialog && (
        <DialogBox 
          onClose={() => setDeleteCommunityDialog(false)} 
          message={
            <div className='flex flex-col items-center'>
              <p className='text-red-600 text-xl font-bold'>Are you sure you want to delete this community?</p>
              <p className='text-gray-500 text-sm'>This action cannot be undone.</p>
            </div>
          }
          mainFuction={deleteCommunityFunc} 
        />
       )}
       {addModsBox && <InviteMods isDeleteDialog={addModsBox} onClose={() => setAddModsBox(false)} />}
    </div>
  );
}