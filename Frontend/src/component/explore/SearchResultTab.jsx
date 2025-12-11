import {SearchCommunityCard} from "../shared/SearchCommunityCard"
import { SearchUserCard , SearchUserCardSkeleton } from "../shared/SearchUserCard"
import {useLazyContinueSearchQuery} from '../../redux/api/api'
import lastRefFunc from '../specific/LastRefFunc'
import { useCallback, useEffect, useRef, useState } from "react"

//user ,post , community

const ShowResultPosts = () => {

}

const ShowResultCommunities = () => {


  return(
    <div className="w-full mb-2 h-24 rounded-md ">  
      <span>Community:</span>
      <div className="flex items-center gap-2 pb-3 mt-2 overflow-y-auto overflow-x-auto flex-shrink-0">
        {auto_communities.map(com => (
          <SearchCommunityCard key={com.id} name={com.name} avatar={com.avatar} banner={com.banner} isFollowing={com.isFollowing} totalFollowers={com.followers} description={com.description} onToggleFollow={() => console.log('follow')} />
        ))}
      </div>
  </div>
  )
}

const ShowResultUsers = ({pageNo = 2 , data , totalPage }) => {
  const observer = useRef() ;
  
  const [page ,setPage] = useState(2) ;
  const [users , setUsers] = useState([...data]) ;

  const [refetch , {data : newData , error , isError,isLoading , isFetching}] = useLazyContinueSearchQuery() ;

  const fetchNew = useCallback((node) => {
    lastRefFunc({
      node,
      page ,
      totalPage ,
      refetch ,
      isLoading , 
      isFetching,
      tab : "user" ,
      observer ,
    })
  } , [page , users , newData , isLoading , isFetching])


  useEffect(() => {
    if(newData.data){
      setUsers(prev => [
        ...prev , ...newData.data
      ])
      setPage(prev => prev+1)
    }
  }, [newData])

  useEffect(() => {if(data?.length){ setUsers([...data]) ; setPage(2) }} , [data])

  useEffect(() => {if(isError ) toast.error(error?.message || 'something went wrong')} , [isError, error])

  return (
    <div className="w-full mb-2 rounded-md ">  
      <span>Users:</span>
      <div className="flex items-center gap-2 pb-3 mt-2 overflow-y-auto overflow-x-auto flex-shrink-0">
        {users.map((user , i) => (
          <div key={user.id} ref={i === users.length - 1 ? fetchNew : null}>
            <SearchUserCard key={user.id} username={user.username} fullname={user.fullname} avatar={user.avatar} isFollowing={user.isFollowing} totalFollowers={user.totalFollowers} onToggleFollow={() => console.log('follow')} />
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