import { ChevronLeftIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { emptyChatName } from '../../redux/reducer/miscSlice';
import { useDispatch, useSelector } from 'react-redux';
import ChatInput from './ChatInput';

export default function MessagingPage({username}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {_id , fullName , avatar } = useSelector(state => state.misc.chatName) ;


  const BackButton =()=>{
    dispatch(emptyChatName({}))
    navigate(-1) ;
  }

  return (
    <div className='dark:text-white  h-full pb-16'>
      <div className='text-white flex items-center gap-2 p-2 w-full border-b-2 border-b-gray-700 '>
        <button onClick={BackButton}><ChevronLeftIcon /></button>
        <img
        src={avatar?.url}
        className="w-12 h-12 rounded-full object-cover mr-2 ring-1"
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
        </div>
      </div>
      <MessageBox/>
      <ChatInput />
    </div>
  )
}

const dummyMessages = [
  { from: "other", text: "Hey, what's up?" },
  { from: "me", text: "All good! You?" },
  { from: "other", text: "Just building XConnect 🚀" },
];

function MessageBox() {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-2">
      {dummyMessages.map((msg, i) => (
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
