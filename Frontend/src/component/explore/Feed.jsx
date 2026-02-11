import {useRef, useState , useCallback, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';

import PostCard from '../post/PostCard'
import PostCardSkeleton from '../shared/PostCardSkeleton';

import {setisDeleteDialog} from '../../redux/reducer/miscSlice';

import {deletePostFunc} from '../shared/SharedFun';
import lastRefFunc from '../specific/LastRefFunc';
import { useLazyGetFeedPostsQuery , useDeletePostMutation } from '../../redux/api/api';
import DialogBox from '../shared/DialogBox';
import CommunityPostCard from '../community/CommunityPostCard';
import { toast } from 'react-toastify';



const TABS = ["For You", "Following", "Communities", "Media"]
function Feed() {
  const dispatch = useDispatch();
  const observer = useRef() ;

  const {isDeleteDialog} = useSelector(state => state.misc);
  
  const [page , setPage] = useState(1) ;
  const [activeTab, setActiveTab] = useState("For You");
  const [pause , setPause] = useState(false) ;
  const [posts , setPosts] = useState([]) ;

  const [fetchMorePost , {data , isError  , isLoading , error , isFetching } ] = useLazyGetFeedPostsQuery() ;
  const [deleteMutation] = useDeletePostMutation() ;

  const lastPostRef = useCallback(node => {
    lastRefFunc({
      observer , 
      node , 
      isLoading , 
      isFetching ,
      page ,
      activeTab ,
      totalPages : null ,
      fetchFunc : fetchMorePost
    })
  } , [fetchMorePost , page , isLoading  , activeTab , ]
  )


  useEffect(() =>{ fetchMorePost({page : 1  , tab : activeTab}) } , [])

  useEffect(() => {
    if(data && data.data){
      if(data.data.length === 0) setPause(true) ;
      
      setPosts(prev => [...prev , ...data.data]) ;
      setPage(prev => prev + 1)
    }
  } , [data])

  useEffect(() => {
    setPosts([]) ;
    setPause(false) ;
    setPage(1) ;
    fetchMorePost({page : 1  , tab : activeTab}) ;
  } , [activeTab])


  useEffect(() => {
    if(isError){
      toast.error(error.data.message || 'Something went wrong while fetching posts. Please try again.')
      console.log('error in fetching feed posts' , error);
    }
  } , [isError , error])

  
  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:px-0 dark:bg-black overflow-hidden rounded-xl ">
      <h1 className="text-2xl font-semibold mb-4">Your Feed</h1>

      <div className="flex border-b overflow-y-clip overflow-x-auto pb-1 pl-2 mb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab) ;
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

      {posts && posts.map((post , i) => (
        <div ref={ (i === posts.length - 1 && !pause )? lastPostRef : null }  key={i} >
          {post?.type !== 'community' ? <PostCard post={post} key={post._id}/> : <CommunityPostCard post={post} heading={true} key={post._id}/>}
        </div>
      ))}
      {(!posts || posts.length < 4) &&  Array.from({length : 4}).map((_  , i) => (
        <PostCardSkeleton key={i}/>
      ))}

      {isDeleteDialog?.isOpen ?
        (<DialogBox message='Are you sure you want to delete this post?' 
          onClose={() => dispatch(setisDeleteDialog({isOpen : false , postId : null}))}
          mainFuction={() => deletePostFunc(isDeleteDialog?.postId , deleteMutation , dispatch)}
          />) : null }
    </div>

  )
}

export default Feed