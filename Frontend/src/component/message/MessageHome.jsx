import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, NavLink } from 'react-router-dom'
import { setChatName } from '../../redux/reducer/miscSlice';
import { useGetRoomsQuery } from '../../redux/api/api';

import {toast} from 'react-toastify'
import ChatCardSekelton from '../shared/ChatCardSekelton';
import '../../assets/styles.css'

const chats = [
  {_id : 152 ,
  fullName : 'John Doe',
  type : 'user' ,
  username : 'john_doe',
  unreadMessage : 5 ,
  lastMessage : 'Hey there! How are you?' ,
  avatar : {
    url : '/avatar-default.svg'
  }
  } ,
  {_id : 153 ,
    fullName : 'John Doe',
    type : 'user' ,
    username : 'ohn_doe',
    unreadMessage : 0 ,
    lastMessage : 'Hey there! How are you?' ,
    avatar : {
      url : '/avatar-default.svg'
    }
    }
]

function MessageHome() {
  const dispatch = useDispatch() ;
  const User = useSelector(state => state.auth.user) ;


  const [activeTab , setActiveTab] = useState('Chats')
  const [rooms , setRooms] = useState([]) ;


  const {data , isError , isLoading , error} = useGetRoomsQuery() ;



  useEffect(() => {
    if(data && data?.data && !isLoading){
      console.log(data.data);
      
      setRooms(data.data) ;
    }
  } , [data]) 

  useEffect(() => {
    if(isError) toast.error(error || 'Something went wrong.')
  } , [error , isError])

  const setSingleChatData =(member , room) => {
    dispatch(setChatName({
      room_id : room._id ,
      _id : member._id ,
      username : member.username ,
      title : member.fullname ,
      avatar : member.avatar ,
      type : 'one-on-one' ,
      lastOnline : member.lastOnline ,
    }))
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:px-0 dark:bg-black  rounded-xl dark:text-white ">
      <h1 className="text-2xl font-semibold mb-4">Messages</h1>
        
        {/*tabs*/}
        <div className="flex border-b overflow-y-clip overflow-x-auto pb-[2px] ">
          <button
            onClick={() => setActiveTab('Chats')}
            className={`px-3 py-1 -mb-px border-b-2 text-sm hover:scale-110 duration-150  ${
              activeTab === 'Chats'
                ? ' font-bold dark:text-black dark:bg-white rounded-t-xl text-cyan-500 border-b-blue-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab('Groups')}
            className={`px-3 py-1 -mb-px border-b-2 text-sm hover:scale-110 duration-150  ${
              activeTab === 'Groups'
                ? ' font-bold dark:text-black dark:bg-white rounded-t-xl text-cyan-500 border-b-blue-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Groups
          </button>
        </div>
        <div className='mt-6 mx-2 gap-4 max-w-6xl'>
          {/* // for onr-on-one */}
          {rooms.length > 0 && activeTab === 'Chats' && 
          rooms.map((room , i) => {
            const member = room.members.filter(member => member._id !== User._id)  
            return (
            <NavLink style={{padding : '0px'}}
            onClick={() => setSingleChatData(member[0] , room) }
            to={`/messages/chat/${member[0].username}`} key={room._id} className="flex items-center justify-between p-2 ">
              <ChatCard i={i} avatar={member[0].avatar} username={member[0].username} fullName={member[0].fullname} lastMessage={room.lastMessage} lastOnline={room?.lastOnline} unreadCount={room.unreadMessage} onClick={() => {}} />
            </NavLink>
          )})}
          {isLoading && 
            Array.from({length : 6}).map((item , i) => (
              <ChatCardSekelton key={i}  />
            ))
          }
        </div>
    </div>
  )
}

export default MessageHome

function ChatCard({
  avatar,
  username,
  fullName,
  lastMessage,
  lastOnline,
  unreadCount,
  onClick,
  i ,
}){
  return (
    <div
      style={{animationDelay : `${i*0.15}s`}}
      onClick={onClick}
      className="flex bg-white w-full mb-3 rounded-xl dark:shadow-sm p-4 dark:bg-black  dark:from-slate-900 dark:to-black dark:text-white shadow-slate-400 shadow-lg border-t dark:border-2 dark:border-white dark:border- border-slate-800/50 duration-200 break-inside-avoid fade-in " 
    >
      {/* Avatar */}
      <img
        src={avatar?.url}
        alt={username}
        className="w-12 h-12 rounded-full object-cover mr-2"
      />

      {/* User Info */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <div className='flex gap-2 items-center'>
            <p className="dark:text-white font-semibold">{fullName}</p>
            <p className="text-sm text-gray-100 bg-cyan-600 dark:bg-white rounded-xl dark:text-black px-1.5 p-[2px] duration-100 font-semibold">@{username}</p>
          </div>
          {/* Last Online */}
          <span className="text-xs text-gray-500">
            • 2hrs ago
          </span>
        </div>

        <div className="flex justify-between items-center mt-1">
          {/* Last Message */}
          <p className={`text-sm truncate max-w-[70%] ${unreadCount > 0 ? 'text-gray-300' : 'text-gray-500'} `}>
          {unreadCount > 0 ? '• ' : ''}
          {lastMessage || "No messages yet"}
          </p>

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-xs text-white px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 