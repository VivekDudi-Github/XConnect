import { useState } from "react";
import {  SendIcon , PaperclipIcon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useSocket } from "../specific/socket";
import {v4 as uuidv4} from 'uuid';


export default function ChatInput({members ,user , setLiveMessages , room_id}) {
  const [message, setMessage] = useState("");

  const socket =  useSocket() ;
 

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit('SEND_MESSAGE' , {message , memberIds : members , room_id }); 
    setLiveMessages(prev => [...prev , 
      {
        _id : uuidv4() ,
        sender : {
          _id : user._id ,
          username : user.username ,
          avatar : user.avatar ,
        } ,
        message ,
        room_id ,
        createdAt : new Date()
      }]) ;
    setMessage("");
  };

  return (
    <div className="flex items-center p-2 gap-2  rounded-xl mt-4 absolute sm:bottom-1 bottom-16 w-[99%]  duration-200">   
      <TextareaAutosize
        type="text"
        value={message}
        maxRows={4}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="w-full p-2  rounded dark:bg-gradient-to-b dark:bg-black duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:text-white text-black  shadow-sm shadow-black/60 resize-none"
      />
      <button
        className=" p-2 text-cyan-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black transition-colors duration-300 active:scale-95" 
      >
        <PaperclipIcon className="" />
      </button>
      <button
        onClick={handleSend}
        className=" p-2 text-cyan-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black transition-colors duration-300 active:scale-95" 
      >
        <SendIcon className="" />
      </button>
    </div>
  );
}
