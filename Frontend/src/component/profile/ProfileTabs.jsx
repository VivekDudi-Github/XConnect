import React, { useCallback , useRef } from 'react'

import { useState } from 'react';
import PostCard from '../post/PostCard';
import Loader from '../shared/Loader'

import { dummyPosts } from '../../sampleData';
import { useLazyGetUserPostsQuery } from '../../redux/api/api';
import { useEffect } from 'react';
import { toast } from 'react-toastify';


const tabs = ['Posts', 'Media' , 'Replies' , 'Likes' , 'History'];

function ProfileTabs( {containerRef}) {
  const observer = useRef(null) ;
  
  const [activeTab, setActiveTab] = useState('Posts');

  const [posts , setPosts] = useState([]);
  const [page , setPage] = useState(1) ;
  const [toatalPages , setTotalPages] = useState(1) ;


  const [fetchMorePost , {data , isError , isFetching , isLoading , error}] = useLazyGetUserPostsQuery();

  console.log(posts , toatalPages , page , isLoading);
  
   const lastPostRef = useCallback(node => {
    if(observer.current) observer.current.disconnect() ;

    observer.current = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting && !isLoading && page <= toatalPages && page > 1){
        console.log('fetcheing post');
        fetchMorePost({page : page , tab: activeTab}) ;
      }
    } , {
      root : null ,
      threshold : 0.5 ,
      rootMargin : '0px'
    })

    if(node) observer.current.observe(node)
  
   } , [fetchMorePost , page , isLoading ,toatalPages , activeTab])

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
        
      {posts.length === 0 && <div className='h-full dark:bg-black bg-white w-full text-gray-500 text-center'>
        No Posts found...
      </div>}

      {posts && (
        <div className="mt-6 mx-2 columns-1 sm:columns-2 lg:columns-3 gap-4">
          {posts.map((post, i) => (
            <div ref={ i === posts.length - 1 ? lastPostRef : null }  key={i} >
              <PostCard post={post}  />
            </div>
          ))}
        </div>
      )}
      

      
      {isLoading && (
        <div className='m-4'>
          <Loader />
        </div>
      )}
    </div>
  );
}


export default ProfileTabs