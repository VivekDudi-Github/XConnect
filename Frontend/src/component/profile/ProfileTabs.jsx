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
import { useParams } from 'react-router-dom';
import CommentItem from '../comment/CommentItem';


const preferCached = true ;
const tabs = ['Posts', 'Media' , 'Replies' , 'Likes' , 'BookMarks' , 'History'];

function ProfileTabs() {
  const dispatch = useDispatch();
  const observer = useRef(null) ;
 
  const {username} =  useParams() ;

  const {isDeleteDialog} = useSelector(state => state.misc);
  const {user} = useSelector(state => state.auth) ;

  const [activeTab, setActiveTab] = useState('Posts');
  
  const [posts , setPosts] = useState([]);
  const [page , setPage] = useState(1) ;
  const [totalPages , setTotalPages] = useState(1) ;

  

  const [deleteMutation] = useDeletePostMutation() ;
  const [fetchMorePost , {data , isError , isLoading , isFetching , error}] = useLazyGetUserPostsQuery({ refetchOnMountOrArgChange: false,});

  
  const lastPostRef = useCallback(node => {
    lastRefFunc({
      observer , 
      node , 
      isLoading , 
      page ,
      activeTab ,
      username : username ?? user?.username ,
      totalPages : totalPages ,
      fetchFunc : fetchMorePost ,
      preferCached
    })
  } , [fetchMorePost , page , isLoading ,totalPages , activeTab]
)


useEffect(() =>{ return () => observer.current?.disconnect()} , [])



useEffect(() => {
  setPage(1);
  setPosts([]) ;
  setTotalPages(1);
  
  fetchMorePost({page : 1 , tab : activeTab , username : username ?? user?.username} , preferCached) ; 
  
}, [activeTab , username])


useEffect(() => {
  if(isError){
    toast.error(`Error fetching posts: ${error?.data?.message || 'Something went wrong while fetching posts.'}`) ;
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
    <div className="mt-8 dark:bg-black bg-white overflow-y-auto h-full pb-14 sm:pb-0">
      <div className="flex border-b overflow-y-clip overflow-x-auto pb-1 ">
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
        
      {!isLoading && !isFetching && posts.length === 0 && <div className='h-full dark:bg-black bg-white w-full text-gray-500 text-center'>
        No Posts found...
      </div>}

      {posts && activeTab === 'Replies' && (
        <div className="mt-6 mx-2 gap-4 max-w-6xl">
          {posts.map((post , i) => (
            <div ref={ i === posts.length - 1 ? lastPostRef : null }  key={post._id}
              className=' mb-3 border-b- dark:border-gray-700 border-gray-600 '
            >
              {post.replyTo === 'post' && <PostCard post={post.postDetails}  />}
              {post.replyTo === 'comment' && <CommentItem data={post.commentDetails} showReply={false} replyButton={null}/>}
              
              <div className='flex justify-start gap-1 w-full'>
                <div className='border-2 self-stretch m-4 mr-0 dark:border-gray-700 border-gray-400 rounded-lg' />
                <div className='w-full scale-90'><CommentItem data={post} showReply={false} replyButton={null}/></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {posts && activeTab !== 'Replies' && (
        <div className="mt-6 mx-2  gap-4 max-w-4xl">
          {posts.map((post, i) => (
            <div ref={ i === posts.length - 1 ? lastPostRef : null }  key={i} >
              <PostCard post={post}  />
            </div>
          ))}
        </div>
      )}
      
      {posts.length === 0  && (isLoading || isFetching) &&  (
        <div className=' mx-2 gap-4 max-w-4xl'>
          {Array.from({length : 6}).map((_  , i) => (
            <PostCardSkeleton key={i}/>
          ))}
        </div>
      ) }
      
      {isFetching && (
        Array.from({length : 6}).map((_  , i) => (
            <PostCardSkeleton key={i}/>
          ))
      )}

      {isDeleteDialog?.isOpen ?
        (<DialogBox message='Are you sure you want to delete this post?' 
          onClose={() => dispatch(setisDeleteDialog({isOpen : false , postId : null}))}
          mainFuction={() => deletePostFunc(isDeleteDialog?.postId , deleteMutation , dispatch)}
          />) : null }
    </div>
  );
}


export default ProfileTabs