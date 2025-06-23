import {useRef, useState , useCallback, useEffect} from 'react'
import PostCard from '../post/PostCard'

import { dummyPosts} from '../../sampleData'
import { useLazyGetFeedPostsQuery } from '../../redux/api/api';

const TABS = ["All", "Following", "Communities", "Media"]
function Feed() {
  const [page , setPage] = useState(1) ;
  const [activeTab, setActiveTab] = useState("All");
  const observer = useRef() ;

  const [posts , setPosts] = useState([]) ;

  const [fetchMorePost , {data , isError  , isLoading , error } ] = useLazyGetFeedPostsQuery() ;

  const lastPostRef = useCallback(node => {
    if(observer.current) observer.current.disconnect() ;

    observer.current = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting && !isLoading  && page > 1){
        console.log('fetching post');
        fetchMorePost({page : page , tab: activeTab}) ;
      }
    } , {
      root : null ,
      threshold : 0.5 ,
      rootMargin : '0px'
    })

    if(node) observer.current.observe(node)
  
   } , [fetchMorePost , page , isLoading  , activeTab])
  
  useEffect(() =>{ fetchMorePost() } , [])

  useEffect(() => {
    if(data && data.data){
      setPosts(prev => [...prev , ...data.data]) ;
      setPage(prev => prev + 1)
    }
  } , [data])


  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:px-0">
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

      {posts.map((post , i) => (
        <div ref={ i === posts.length - 1 ? lastPostRef : null }  key={i} >
          <PostCard post={post}  />
        </div>
      ))}
    </div>

  )
}

export default Feed