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



const TABS = ["All", "Following", "Communities", "Media"]
function Feed() {
  const dispatch = useDispatch();
  const observer = useRef() ;

  const {isDeleteDialog} = useSelector(state => state.misc);
  
  const [page , setPage] = useState(1) ;
  const [activeTab, setActiveTab] = useState("All");
  
  const [posts , setPosts] = useState([]) ;

  const [fetchMorePost , {data , isError  , isLoading , error } ] = useLazyGetFeedPostsQuery() ;
  const [deleteMutation] = useDeletePostMutation() ;

  const lastPostRef = useCallback(node => {
    lastRefFunc({
      observer , 
      node , 
      isLoading , 
      page ,
      activeTab ,
      totalPages : null ,
      fetchFunc : fetchMorePost
    })
  } , [fetchMorePost , page , isLoading  , activeTab , ]
  )


  useEffect(() =>{ fetchMorePost() } , [])

  useEffect(() => {
    if(data && data.data){
      setPosts(prev => [...prev , ...data.data]) ;
      setPage(prev => prev + 1)
    }
  } , [data])


  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:px-0 dark:bg-black  rounded-xl ">
      <h1 className="text-2xl font-semibold mb-4">Your Feed</h1>

      <div className="flex gap-4 border-b pb-2 mb-4 overflow-x-auto ml-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {posts && posts.map((post , i) => (
        <div ref={ i === posts.length - 1 ? lastPostRef : null }  key={i} >
          {post?.type !== 'community' ? <PostCard post={post} key={post._id}/> : <CommunityPostCard post={post} key={post._id}/>}
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