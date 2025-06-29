import React, { useCallback , useRef , useEffect , useState } from 'react'
import { toast } from 'react-toastify';
import { useDispatch , useSelector} from 'react-redux';

import { useDeletePostMutation, useLazyGetUserPostsQuery } from '../../redux/api/api';

import DialogBox from '../shared/DialogBox';
import PostCard from '../post/PostCard';
import PostCardSkeleton from '../shared/PostCardSkeleton';
import lastRefFunc from '../specific/LastRefFunc';
import {setisDeleteDialog} from '../../redux/reducer/miscSlice';
import { deletePostFunc } from '../shared/SharedFun';




const tabs = ['Posts', 'Media' , 'Replies' , 'Likes' , 'History'];

function ProfileTabs() {
  const dispatch = useDispatch();
  const observer = useRef(null) ;
 
  const {isDeleteDialog} = useSelector(state => state.misc);

  const [activeTab, setActiveTab] = useState('Posts');

  
  const [posts , setPosts] = useState([]);
  const [page , setPage] = useState(1) ;
  const [toatalPages , setTotalPages] = useState(1) ;

  

  const [deleteMutation] = useDeletePostMutation() ;
  const [fetchMorePost , {data , isError , isFetching , isLoading , error}] = useLazyGetUserPostsQuery();

  console.log(posts , toatalPages , page , isLoading);
  
  const lastPostRef = useCallback(node => {
    lastRefFunc({
      observer , 
      node , 
      isLoading , 
      page ,
      activeTab ,
      toatalPages : toatalPages ,
      fetchFunc : fetchMorePost ,
    })
  } , [fetchMorePost , page , isLoading ,toatalPages , activeTab]
)


useEffect(() =>{ return () => observer.current?.disconnect()} , [])

useEffect(() => {console.log('fetcehed thorugh useEffect');
  if(page === 1){
    fetchMorePost({page : 1 , tab : activeTab})
  }
}, [])

useEffect(() => {
  if(isError){
    toast.error(`Error fetching posts: ${error.data.message || 'Something went wrong while fetching posts.'}`) ;
    console.error('Error fetching posts:', error);
  }
} , [isError]) ;

useEffect(() => {
  if(data && data.data){
    setPosts(prev => [...prev , ...data.data.posts]) ;
    setTotalPages(data.data.totalPages)
    setPage(prev => prev + 1)
  }
} , [data])


  return (
    <div className="mt-8 dark:bg-black bg-white overflow-visible h-full">
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
        
      {!isLoading && posts.length === 0 && <div className='h-full dark:bg-black bg-white w-full text-gray-500 text-center'>
        No Posts found...
      </div>}

      {posts && (
        <div className="mt-6 mx-2 columns-1 sm:columns-1 lg:columns-3 gap-4 max-w-6xl">
          {posts.map((post, i) => (
            <div ref={ i === posts.length - 1 ? lastPostRef : null }  key={i} >
              <PostCard post={post}  />
            </div>
          ))}
        </div>
      )}
      
      {posts.length === 0  && isLoading  &&  (
        <div className='mt-6 mx-2 columns-1 sm:columns-1 lg:columns-3 gap-4 max-w-6xl'>
          {Array.from({length : 6}).map((_  , i) => (
            <PostCardSkeleton key={i}/>
          ))}
        </div>
      ) }
      
      {isDeleteDialog?.isOpen ?
        (<DialogBox message='Are you sure you want to delete this post?' 
          onClose={() => dispatch(setisDeleteDialog({isOpen : false , postId : null}))}
          mainFuction={() => deletePostFunc(isDeleteDialog?.postId , deleteMutation , dispatch)}
          />) : null }
    </div>
  );
}


export default ProfileTabs