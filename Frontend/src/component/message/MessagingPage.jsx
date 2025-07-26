import { ChevronLeftIcon, Eclipse, EllipsisIcon, EllipsisVerticalIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { emptyChatName } from '../../redux/reducer/miscSlice';
import { useDispatch, useSelector } from 'react-redux';
import ChatInput from './ChatInput';
import { useSocket } from '../specific/socket';
import moment from 'moment';
import '../../assets/styles.css'

import RenderPostContent from '../specific/RenderPostContent'
import { clearUnreadMessage } from '../../redux/reducer/messageSlice';


const dummyMessages = [
  {_id: "68866a59d0c7b9752f68d1dc" ,
    createdAt: "2025-07-27T18:05:13.884Z" ,
    message: "yes" ,
    room_id: "688110b6e4c6c30fdf87bf55" ,
    sender: {
      _id: "6846a3b1175315af6d4ebc6e", 
      username: "three",  
      avatar: { url: "", publicId: "" } ,
    } ,
  } ,
  // { from: "me", text: "All good! You?" },
  // { from: "other", text: "Just building XConnect 🚀" },
];

export default function MessagingPage({username}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth)
  const {byUnreadMessage , byRoom} = useSelector(state => state.messagesBuffer)

  const [messages , setMessages] = useState([]) ;
  const [liveMessages , setLiveMessages] = useState([]) ;
console.log(messages);

  const {title , avatar , username : userIdentifier  , lastOnline , type , _id , room_id } = useSelector(state => state.misc.chatName) ;
  
  useEffect(() => {
    const timeOut = setTimeout(() => {
      if(room_id){
        const byRoomsMessages = byRoom?.[room_id] || [] ;
        const ureadMessages = byUnreadMessage?.[room_id] || [] ;
        
        setMessages(prev => [
          ...prev,
          ...byRoomsMessages ,
          ...ureadMessages ,
        ]);
      }
    } , 500)
    
    return () => {
      clearTimeout(timeOut) ;
      setMessages([]) ;
      dispatch(clearUnreadMessage(room_id || '')) ;
    }
  } , [])

  const socket =  useSocket() ;

  useEffect(() => {
    if(!socket) return ;
    const receiveMessage = (data) => {

    }
    socket.on('RECEIVE_MESSAGE' , (data) => {
      if(data.room_id === room_id){
        setLiveMessages(prev => [...prev , data]) ; 
      }
    })
    return () => {
      socket.off('RECEIVE_MESSAGE');
    }
  } , [username])

  useEffect(() => {
    setTimeout(() => {
      if(!room_id){
        navigate('/messages') ;
      }
    } , 500)
  }, [room_id])


  const BackButton =()=>{
    dispatch(emptyChatName()) ;
    navigate(-1) ;
  }

  return (
    <div className='dark:text-white  h-full sm:p b-16 pb-32 text-black '>
      <div className='text-white flex items-center gap-2 p-2 w-full border-b-2 border-b-gray-700 '>
        <button onClick={BackButton}><ChevronLeftIcon className='text-black dark:text-white'/></button>
        <img
        src={avatar?.url}
        className="w-12 h-12 rounded-full object-cover mr-2 ring-1"
      />

      {/* User Info */}
      <div className="flex flex-col flex-1">
        <div className="flex sm:flex-row flex-col justify-between sm:items-center items-start gap-1">
          <div className='flex gap-2 items-center'>
            <p className="dark:text-white text-black font-bold">{title}</p>
            <p className="text-sm text-gray-100 bg-cyan-600 dark:bg-white rounded-xl dark:text-black px-1.5 p-[2px] duration-100 font-semibold">@{userIdentifier }</p>
          </div>
          {/* Last Online */}
          <span className="text-xs flex flex-row-reverse  justify-between items-center sm:block text-gray-500 w-full sm:w-fit ">
            <div className='w-fit sm:w-full rotate-180 p-2 pb-0'> <EllipsisVerticalIcon size={17} /></div>
            Last online • {moment(lastOnline).fromNow()}
          </span>
          </div>
        </div>
      </div>
      <MessageBox messages={messages} liveMessages={liveMessages} user={user}/>
      <ChatInput user={user} members={[_id]} setLiveMessages={setLiveMessages} room_id={room_id} />
    </div>
  )
}


function MessageBox({messages , liveMessages, user}) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-2 h-full">
      {messages.map((msg, i) => {
        let meSender = msg._id === user._id 
        return (
        <div key={msg._id} className={`flex ${meSender ? "justify-end" : "justify-start"}`}>
          <div
            className={`px-4 py-2 fade-in rounded-2xl max-w-xs font-medium text-sm ${
              meSender
                ? "bg-sky-600 text-white"
                : "bg-gray-700 text-gray-100"
            }`}
          >
            {msg.message}
          </div>
        </div>
      )})}
      {liveMessages.map((msg, i) => {
        let meSender = msg.sender._id === user?._id 
        return (
        <div key={msg._id} className={`flex ${meSender ? "justify-end" : "justify-start"}`}>
          <div
            className={`px-4 py-2 fade-in rounded-2xl max-w-xs min-w-2/3 font-medium text-sm ${
              meSender
                ? "bg-sky-600 text-white"
                : "bg-gray-700 text-gray-100"
            }`}
          >
           <pre className="dark:text-gray-300 font-sans text-wrap"><RenderPostContent text={msg?.message}/></pre>
          </div>
        </div>
      )})}
    </div>
  );
}
