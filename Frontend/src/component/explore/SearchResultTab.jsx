import {SearchCommunityCard} from "../shared/SearchCommunityCard"
import { SearchUserCard , SearchUserCardSkeleton } from "../shared/SearchUserCard"
import {useLazyContinueSearchQuery} from '../../redux/api/api'
import lastRefFunc from '../specific/LastRefFunc'
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify";
import PostCard from "../post/PostCard"

//user ,post , community

const ShowResultPosts = ({ data , totalPages , q}) => {
  const observer = useRef() ;
  console.log('totalPages' , totalPages, data , q) ;
  const [page ,setPage] = useState(2) ;
  const [posts , setPosts] = useState([...data]) ;

  const [refetch , {data : newData , error , isError,isLoading , isFetching}] = useLazyContinueSearchQuery() ;

  const fetchNew = useCallback((node) => {
    lastRefFunc({
      node,
      page ,
      totalPages ,
      fetchFunc :refetch ,
      isLoading , 
      isFetching,
      activeTab : "post" ,
      observer ,
      q
    })
  } , [page , posts , newData , isLoading , isFetching])


  useEffect(() => {
    if(newData?.data){
      setPosts(prev => [
        ...prev , ...newData.data
      ])
      setPage(prev => prev+1)
    }
  }, [newData])

  useEffect(() => {if(data?.length){ setPosts([...data]) ; setPage(2) }} , [data])

  useEffect(() => {if(isError ) toast.error(error?.message || 'something went wrong')} , [isError, error])

  return (
    <div className="w-full mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl">
      {posts.map((post , i) => (
        <div key={post._id} ref={i === posts.length - 1 ? fetchNew : null} className=" break-inside-avoid-column">
          <PostCard post={post} />
        </div>
      ))}
    </div> 
  )
}

const ShowResultCommunities = ({data , totalPages , q}) => {
const observer = useRef() ;
  
  const [page ,setPage] = useState(2) ;
  const [communities , setCommunities] = useState([...data]) ; 

  const [refetch , {data : newData , error , isError,isLoading , isFetching}] = useLazyContinueSearchQuery() ;

  const fetchNew = useCallback((node) => {
    lastRefFunc({
      node,
      page ,
      totalPages ,
      fetchFunc: refetch ,
      isLoading , 
      isFetching,
      activeTab : "community" ,
      observer ,
      q
    })
  } , [page , communities ,  isLoading , isFetching])


  useEffect(() => {
    if(newData?.data){
      setCommunities(prev => [
        ...prev , ...newData.data
      ])
      setPage(prev => prev+1)
    }
  }, [newData])

  useEffect(() => {if(data?.length){ setCommunities([...data]) ; setPage(2) }} , [data])

  useEffect(() => {if(isError ) toast.error(error?.message || 'something went wrong')} , [isError, error])

  if(communities.length === 0) return null ;  
  return(
    <div className="w-full mb-2 min-h-[175px] rounded-md ">  
      <span>Community:</span>
      <div className="flex items-center gap-2 pb-3 mt-2 overflow-y-auto overflow-x-auto flex-shrink-0">
        {communities.map((com , i) => (
          <div key={com._id} ref={i === communities.length - 1 ? fetchNew : null}>
            <SearchCommunityCard key={com._id} _id={com._id} name={com.name} avatar={com.avatar} banner={com.banner} isFollowing={com.isFollowing} totalFollowers={com.totalFollowers} description={com.description} />
          </div>
        ))}
      </div>
    </div>
  )
}

const ShowResultUsers = ({ data , totalPages ,q }) => {
  const observer = useRef() ;
  
  const [page ,setPage] = useState(2) ;
  const [users , setUsers] = useState([...data]) ;

  const [refetch , {data : newData , error , isError,isLoading , isFetching}] = useLazyContinueSearchQuery() ;

  const fetchNew = useCallback((node) => {
    lastRefFunc({
      node,
      page ,
      totalPages  ,
      fetchFunc :refetch ,
      isLoading , 
      isFetching,
      tab : "user" ,
      observer ,
      q
    })
  } , [page , users , isLoading , isFetching])


  useEffect(() => {
    if(newData?.data){
      setUsers(prev => [
        ...prev , ...newData.data
      ])
      setPage(prev => prev+1)
    }
  }, [newData])

  useEffect(() => {if(data?.length){ setUsers([...data]) ; setPage(2) }} , [data])

  useEffect(() => {if(isError ) toast.error(error?.message || 'something went wrong')} , [isError, error])

  if(users.length === 0) return null ;
  return (
    <div className="w-full mb-2 rounded-md ">  
      <span>Users:</span>
      <div className="flex items-center gap-2 pb-3 mt-2 overflow-y-auto overflow-x-auto flex-shrink-0">
        {users.map((user , i) => (
          <div key={user._id} ref={i === users.length - 1 ? fetchNew : null}>
            <SearchUserCard key={user._id} user={user} />
          </div>
        ))}
        {(isLoading || isFetching) && Array(4).map((_ ,i) => <SearchUserCardSkeleton key={i} />) }
      </div>
    </div>
  )
}

export {
  ShowResultPosts, 
  ShowResultCommunities ,
  ShowResultUsers 
}