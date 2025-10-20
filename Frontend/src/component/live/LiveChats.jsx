import { useEffect, useRef, useState } from "react";
import {ArrowDownIcon, EllipsisVerticalIcon,} from 'lucide-react' ;
import { useSocket } from "../specific/socket";
import { toast } from "react-toastify";
import Loader from "../shared/Loader";
import {v4 as uuidv4} from 'uuid';
import { useLazyGetLiveChatsQuery } from "../../redux/api/api";
import { useSelector } from "react-redux";

export default function LiveChat({closeFunc , streamData }) {
  const socket = useSocket();
  const auth = useSelector((state) => state.auth);


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const containerRef = useRef(null);

  const [openOptions , setOpenOptions] = useState('') ;
  const [BlockList , setBlockList] = useState(new Set('123')) ;
  
  const [refetch , {data , error , isError , isLoading , isFetching}] = useLazyGetLiveChatsQuery() ;


  const sendMessage = () => {
    console.log(input);
    
    if (!input.trim()) return;
    if(!socket) return toast.error('Socket not connected'); 
    socket.emit("SEND_LIVE_MESSAGE", {
      message: input.trim(),
      roomId: streamData._id,
    });
    setMessages(prev => [
      ...prev,
      {
        _id : uuidv4() ,
        sender : {
          _id : auth.user._id ,
          username : auth.user.username ,
          avatar : auth.user.avatar ,
        } ,
        message : input.trim() ,
        room : streamData._id ,
        createdAt : new Date().toUTCString()
      }
    ])
    setInput('')
  };

  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;

  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

  if (distanceFromBottom <= 80) {
    requestAnimationFrame(() => {
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth',
      });
    });
  }
}, [messages]);

  useEffect(() => {if(streamData) refetch({id :streamData._id  , limit : 2 , page : 1})} , []) 

  useEffect(() => {
    if(data?.data){
      sendMessage(prev => [...prev , ...data.data]) ;
    }
  } , [data])

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  };
  const toggleSetOptions = (i) => {
    setOpenOptions(i);
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
    {/* Messages area */}
    <div ref={containerRef} className="absolute top-0 left-0 right-0 bottom-[50px] overflow-y-auto p-3 space-y-2 z-10">
      {!streamData ? (<Loader/>) : messages.map((msg, i) => {
        return (
        <div key={i} className={`bg-gray-100 w-full flex items-center justify-between gap-1 text-wrap break-words p-2 rounded-lg fade-in duration-200 relative ${openOptions == i ? 'z-50' : 'z-0' } `}>
          <div className=" w-fit">
            <img className="rounded-full size-8 mr-1" src={msg.user === "You" ? "https://i.pravatar.cc/300?img=1" : "https://i.pravatar.cc/300?img=2"} alt="Avatar" />
            
          </div>
          <div className="w-full text-left"><strong>{msg?.sender?.username}</strong> {' : '}{BlockList.has(msg.user) ? (<i>Blocked</i>) : msg.message}</div>
          <div className="relative" onClick={() => toggleSetOptions(i)}>
            <EllipsisVerticalIcon className="text-gray-500 hover:text-gray-700 cursor-pointer size-5 z-0 " />
            {openOptions === i && (
              <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg hover:cursor-pointer space-y-1 border border-gray-200 z-50 overflow-hidden">
                <div className=" hover:bg-slate-200 duration-200 px-2">{BlockList.has(msg.user) ? 'Unblock' : 'Block'}</div>
                <div className=" hover:bg-slate-200 duration-200 px-2">Report</div>
                <div className=" hover:bg-slate-200 duration-200 px-2">Delete</div>
              </div>
            )}
          </div>
        </div>
        )
      })}
    </div>

    <div>
      <button className="absolute bottom-14 right-2 bg-white p-1 rounded-full shadow-lg active:scale-95 duration-200" onClick={scrollToBottom}>
        <ArrowDownIcon  />
      </button>
    </div>

    {/* Input bar fixed at bottom */}
    <div className="p-1  flex absolute bottom-0 left-0 right-0 ">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Send a message..."
        className="flex-1 p-2 border rounded-lg"
      />
      <button
        disabled={!streamData}
        onClick={sendMessage}
        className="ml-2 bg-blue-500 text-white px-4 rounded-lg"
      >
        Send
      </button>
    </div>
  </div>
  );
}
