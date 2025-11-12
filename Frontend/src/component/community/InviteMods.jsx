import React, { useCallback, useEffect, useRef, useState } from 'react' ;
import { useParams } from 'react-router-dom';
import SearchBar from '../specific/search/SearchBar'
import { CheckIcon, Loader, XIcon } from 'lucide-react';
import { useInviteModsMutation, useLazySearchUsersQuery } from '../../redux/api/api';
import {toast}  from 'react-toastify';
import lastRefFunc from '../specific/LastRefFunc'

const list = [
  {_id: 1, fullname: 'User One', username: 'userone' , avatar : 'https://i.pravatar.cc/150?img=1' , followers : '10k'},
  {_id: 2, fullname: 'User Two', username: 'usertwo' , avatar : 'https://i.pravatar.cc/150?img=2', followers : '277k'} ,
  {_id: 3, fullname: 'User Three', username: 'userthree' , avatar : 'https://i.pravatar.cc/150?img=3', followers : '5k'} ,
  {_id: 4, fullname: 'User Four', username: 'userfour' , avatar : 'https://i.pravatar.cc/150?img=4', followers : '10k'} ,
  {_id: 5, fullname: 'User Five', username: 'userfive' , avatar : 'https://i.pravatar.cc/150?img=5', followers : '10k'} ,
  {_id: 6, fullname: 'User Six', username: 'usersix' , avatar : 'https://i.pravatar.cc/150?img=6', followers : '10k'} ,
  {_id: 7, fullname: 'User Seven', username: 'userseven' , avatar : 'https://i.pravatar.cc/150?img=7', followers : '10k'} ,
  {_id: 8, fullname: 'User Eight', username: 'usereight' , avatar : 'https://i.pravatar.cc/150?img=8', followers : '10k'} ,
  {_id: 9, fullname: 'User Nine', username: 'usernine' , avatar : 'https://i.pravatar.cc/150?img=9', followers : '10k'} ,
  {_id: 10, fullname: 'User Ten', username: 'userten' , avatar : 'https://i.pravatar.cc/150?img=10', followers : '10k'} ,
  {_id: 11, fullname: 'User Eleven', username: 'usereleven' , avatar : 'https://i.pravatar.cc/150?img=11', followers : '10k'} ,
  {_id: 12, fullname: 'User Twelve', username: 'usertwelve' , avatar : 'https://i.pravatar.cc/150?img=12', followers : '10k'} ,
  {_id: 13, fullname: 'User Thirteen', username: 'userthirteen' , avatar : 'https://i.pravatar.cc/150?img=13', followers : '10k'} ,
  {_id: 14, fullname: 'User Fourteen', username: 'userfourteen' , avatar : 'https://i.pravatar.cc/150?img=14', followers : '10k'} ,
]

function InviteMods({isDialog = true , onClose}) {
  const {id} = useParams() ;

  const observer = useRef() ;

  const [users , setUsers] = useState(new Map()) ;
  const [results , setResults] = useState([]) ;
  const [page , setPage ] = useState(1) ;
  const [endOfPage , setEndOfPage] = useState(false) ;

  const [refetch , {data ,error , isError , isLoading , isFetching} ] = useLazySearchUsersQuery() ;

  const [inviteMods] = useInviteModsMutation() ;

  const close = () => {
    onClose() ;
  }
  const toggleUser = (u) => {
    if(!users.has(u._id)){
      setUsers(new Map(users.set(u._id , u)))
    }else {
      let map = new Map(users) ;
      map.delete(u._id) ;
      setUsers(map) ;
    }
  }

  const inviteFunc = () => {
    try {
      inviteMods({communityId : id , mods : Array.from(users.keys())}) ;
    } catch (error) {
      console.log(error);
      toast.error('Error inviting moderators') ;
    }
  }
  
  const onSearch = (q ) => {
    try {
      setPage(1) 
      setEndOfPage(false)
      setResults([])
      refetch({q : q , page : 1})
    } catch (error) {
      console.log(error);
      return toast.error('Error fetching search results') ;
    } 
  }

  useEffect(() => {
    if(data?.data){
      let d = data?.data ;
      if(d.results.length < 20) {
        setEndOfPage(true) 
      }
      if(d.data?.page === 1){
        setResults([...d.results])
      }else {
        setResults(prev => [...prev , ...d.results])
      }
      setPage(prev => prev+1) 
    }
  } ,[data])

  useEffect(() => {
    if(isError){
      toast.error(error)
    }
  } , [isError])

  const lastItemRef = useCallback((node) => {
    if(endOfPage) return ;
    lastRefFunc({
      page : page ,
      fetchFunc : refetch ,
      observer ,
      node ,
      isLoading ,
      isFetching
    })
  } , [page , refetch , isLoading , isFetching , endOfPage ])

  console.log(users);
  
  
  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center duration-200 transition-opacity  ${isDialog ? 'opacity-100' : 'opacity-0 hidden'}`}> 
      <div className="dark:bg-black bg-white z-50 text-white rounded-xl p-6 max-w-lg w-full text-center custom-box dark:shadow dark:border-none  shadow-slate-500/10 shadow-lg border-t"> 
        <div className=' flex justify-between'>
          <span>Invite Moderators</span>
          <button onClick={close} className='custom-button p-2'>
            <XIcon size={17}/>
          </button>
        </div>
        
        <div className='py-1 flex'><SearchBar onSearch={onSearch} /></div>
        <div className='flex flex-wrap gap-2 text-black dark:text-white max-h-32 overflow-y-scroll justify-center mb-2'>
          {[...users.values()].map((u, i) => (
            <div
              className="rounded-md fade-in flex p-2 border-[2px] items-center border-white shadowLight gap-2"
              key={i}
            >
              <img className="size-6 rounded-md" src={u?.avatar?.url} alt="" />
              {u.username}
              <XIcon onClick={() => toggleUser(u)} size={17} />
            </div>
          ))}
          { users.size > 0 && 
          <button className='custom-button border-2 border-white shadowLight p-2' onClick={inviteMods} >
            Invite
          </button>}
        </div>
        <div className='text-gray-600 text-sm text-left'>List :</div>
        <div className='h-48 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-2 space-y-2 text-black dark:text-white '>
          {results.map((user , i) => (
            <div className='flex px-2' 
              key={user._id} 
              ref={i === results.length -1 ? lastItemRef : null} 
            >
              <span className='flex items-center gap-2 truncate'>
                <img className='size-8 rounded-full ' src={user?.avatar?.url} alt="" />
                    @{user.username} • <strong className='truncate'>{user.fullname}</strong> • <span className='text-gray-500 text-sm truncate'>{user.followers} followers</span>
              </span>
              <button 
              onClick={() => {toggleUser(user)}}
              className={`ml-auto px-3 py-1 bg-white text-black rounded-full text-sm  hover:text-white active:scale-95 transition-all duration-200 ${users.has(user._id) ? 'bg-green-500' : 'hover:bg-purple-700'} `}> 
                {users.has(user._id) ? <CheckIcon color='white' /> : 'Invite'}
              </button>
            </div>
          ))}
          <Loader className={`mx-auto my-2 ${isLoading || isFetching ? 'block' : 'hidden'} animate-spin duration-200`} />
        </div>
      </div>
    </div>
    
  )
}

export default InviteMods