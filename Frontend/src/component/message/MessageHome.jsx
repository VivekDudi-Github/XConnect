import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, NavLink } from 'react-router-dom'
import { setChatName } from '../../redux/reducer/miscSlice';
import { useGetRoomsQuery } from '../../redux/api/api';

import {toast} from 'react-toastify'
import ChatCardSekelton from '../shared/ChatCardSekelton';

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
  const [activeTab , setActiveTab] = useState('Chats')

  const [rooms , setRooms] = useState(chats) ;

  const setChatData =(_id , username , fullName , avatar) => {
    dispatch(setChatName({
      _id , username , fullName ,avatar 
    }))
  }

  const {data , isError , isLoading , error} = useGetRoomsQuery() ;



  useEffect(() => {
    if(data && data?.data && !isLoading){
      setRooms(data.data.rooms) ;
    }
  } , [data]) 

  useEffect(() => {
    if(isError) toast.error(error || 'Something went wrong.')
  } , [error , isError])

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
          {rooms.length > 0 && rooms.map((room) => (
            <NavLink
            onClick={() => setChatData(room._id , room.username , room.fullName , room.avatar)}
            to={`/messages/chat/${room.username}`} key={room._id} className="flex items-center justify-between p-2 ">
              <ChatCard avatar={room.avatar} username={room.username} fullName={room.fullName} lastMessage={room.lastMessage} lastOnline={room?.lastOnline} unreadCount={room.unreadMessage} onClick={() => {}} />
            </NavLink>
          ))}
          {!isLoading && 
            Array.from({length : 6}).map((item , i) => (
              <ChatCardSekelton  />
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
}){
  return (
    <div
      onClick={onClick}
      // className="flex items-center w-full gap-4 p-4 hover:bg-[#1f1f1f] cursor-pointer border-b border-gray-800"
      className="flex bg-white w-full rounded-xl dark:shadow-sm p-4 dark:bg-black  dark:from-slate-900 dark:to-black dark:text-white shadow-slate-400 shadow-lg border-t dark:border-2 dark:border-white dark:border- border-slate-800/50 duration-200 break-inside-avoid " 
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