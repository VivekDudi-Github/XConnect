import { ChevronLeftIcon, Eclipse, EllipsisIcon, EllipsisVerticalIcon } from 'lucide-react'
import React, { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { emptyChatName } from '../../redux/reducer/miscSlice';
import { useDispatch, useSelector } from 'react-redux';
import ChatInput from './ChatInput';
import { useSocket } from '../specific/socket';
import moment from 'moment';


const dummyMessages = [
  { from: "other", text: "Hey, what's up?" },
  { from: "me", text: "All good! You?" },
  { from: "other", text: "Just building XConnect 🚀" },
];

export default function MessagingPage({username}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [messages , setMessages] = useState(dummyMessages) ;

  const {title , avatar , username : userIdentifier  , lastOnline , type , _id , room_id } = useSelector(state => state.misc.chatName) ;
  
  const socket =  useSocket() ;


  useEffect(() => {
    setTimeout(() => {
      if(!room_id){
        navigate('/messages') ;
      }
    } , 1000)
  }, [room_id])


  const BackButton =()=>{
    dispatch(emptyChatName({}))
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
      <MessageBox messages={messages}/>
      <ChatInput members={[_id]} setMessages={setMessages} />
    </div>
  )
}


function MessageBox({messages}) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-2">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
          <div
            className={`px-4 py-2 rounded-2xl max-w-xs font-medium text-sm ${
              msg.from === "me"
                ? "bg-sky-600 text-white"
                : "bg-gray-700 text-gray-100"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
