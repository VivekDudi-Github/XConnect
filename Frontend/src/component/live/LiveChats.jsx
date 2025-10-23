import { useCallback, useEffect, useRef, useState } from "react";
import {ArrowDownIcon, EllipsisVerticalIcon,} from 'lucide-react' ;
import { useSocket } from "../specific/socket";
import { toast } from "react-toastify";
import Loader from "../shared/Loader";
import { useLazyGetLiveChatsQuery } from "../../redux/api/api";
import { useSelector } from "react-redux";
import RenderPostContent from "../specific/RenderPostContent";
import lastRefFunc from "../specific/LastRefFunc";
import moment from 'moment';

export default function LiveChat({closeFunc , streamData , isProducer }) {
  const socket = useSocket();
  const auth = useSelector((state) => state.auth.user);


  let observer = useRef(null);
  const containerRef = useRef(null);
  const [earliestMessage_id , setEarliestMessage_id ] = useState(null) ;
  const lastFetched_id  = useRef(null) ;

  const [messages, setMessages] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);
  const [input, setInput] = useState("");

  const [openOptions , setOpenOptions] = useState('') ;
  const [BlockList , setBlockList] = useState(new Set('')) ;
  

  const [refetch , {data , error , isError , isLoading , isFetching}] = useLazyGetLiveChatsQuery() ;


  const sendMessage = () => {
    if (!input.trim()) return;
    if(!socket) return toast.error('Socket not connected'); 
    socket.emit("SEND_LIVE_MESSAGE", {
      message: input.trim(),
      roomId: streamData._id,
    } , () => setInput(''));
  };

  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;

  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

  if (distanceFromBottom <= 100) {
    requestAnimationFrame(() => {
      container.scrollTo({
        top: scrollHeight,
        behavior: 'smooth',
      });
    });
  }
}, [liveMessages]);

  useEffect(() => {if(streamData) refetch({id :streamData._id , lastId : earliestMessage_id  , limit : 5 })} , []) ;

  useEffect(() => {
    if(!socket) return;
    socket.on('RECEIVE_LIVE_MESSAGE' , async(obj) => {
      console.log(obj , 'message recived');
      
      setLiveMessages(prev => [...prev , obj])
    })
    return () => {
      socket.off('RECEIVE_LIVE_MESSAGE')
    }
  } , [socket])

  useEffect(() => {
    if(data?.data?.messages && data.data.messages.length > 0){
      const prevScrollHeight = containerRef.current.scrollHeight;
      const prevScrollTop = containerRef.current.scrollTop;
      console.log(data.data?.messages);
      
      setEarliestMessage_id(data.data.messages[0]?._id) ;
      setMessages(prev => [...data.data.messages , ...prev ]) ;

      requestAnimationFrame(() => {
        const newScrollHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
      })
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
    openOptions === i ? setOpenOptions('') :setOpenOptions(i); 
  };

  const refetchFunc = () => {
    if(lastFetched_id.current === earliestMessage_id) return ;
    console.log('fecthing chats');
    console.log(earliestMessage_id , lastFetched_id.current);
    
    lastFetched_id.current = (earliestMessage_id) ;
    refetch({id : streamData._id , lastId : earliestMessage_id  , limit : 5 } , )
  }

  const topMessageRef = useCallback((node) => {
      lastRefFunc({
        observer , 
        node , 
        page : 2 ,
        fetchFunc : refetchFunc ,
      })
  } , [messages] )

  return (
    <div className="relative w-full h-full overflow-hidden">
    {/* Messages area */}
    <div ref={containerRef} className="absolute top-0 left-0 right-0 bottom-[50px] overflow-y-auto p-1 space-y-1 z-10">
      {!streamData ? (<Loader/>) : 
      messages.map((msg, i) => {
        return (
          <div key={i} ref={i === 0 ? topMessageRef : null} className={`w-full border-b border-gray-500 flex items-start justify-between gap-0.5 text-wrap break-words p-1 text-sm fade-in duration-200 relative ${openOptions == i ? 'z-50' : 'z-0'} 
            ${(msg.sender._id === streamData?.host) ? 'dark:bg-white dark:text-black text-white bg-black rounded-lg' : 'dark:text-white rounded-sm'}`}>
            <div className="w-fit">
              <img className="rounded-full size-8 mr-1 dark:border " src={msg?.sender?.avatar?.url || './avatar-default.svg'} alt="" />
            </div>
            <div className="w-full text-left">
              <strong>{msg?.sender?.username}</strong> {' : '} 
              {/* {moment(msg.createdAt).fromNow()} */}
              {BlockList.has(msg.user) ? (<i>Blocked</i>) :   <RenderPostContent text={msg.message} />}
            </div>
            <div className="relative" onClick={() => toggleSetOptions(i)}>
              <EllipsisVerticalIcon className="text-gray-500 hover:text-gray-700 cursor-pointer size-4 z-0" />
              {openOptions === i && (
                <div className="absolute top-6 right-0 bg-white rounded-lg shadow-lg hover:cursor-pointer space-y-0.5 border border-gray-200 z-50 overflow-hidden text-sm text-black">
                  <div className="hover:bg-slate-200 duration-200 px-2">{BlockList.has(msg.user) ? 'Unblock' : 'Block'}</div>
                  <div className="hover:bg-slate-200 duration-200 px-2">Report</div>
                </div>
              )}
            </div>
          </div>
        )
      })}
      {liveMessages.length > 0 ?  
      liveMessages.map((msg, i) => {
        return (
          <div key={i} ref={i === 0 ? topMessageRef : null} className={`w-full border-b border-gray-500 flex items-start justify-between gap-0.5 text-wrap break-words p-1 text-sm fade-in duration-200 relative ${openOptions == i ? 'z-50' : 'z-0'} 
            ${(msg.sender._id === streamData?.host) ? 'dark:bg-white dark:text-black text-white bg-black rounded-lg' : 'dark:text-white rounded-sm'}`}>
            <div className="w-fit">
              <img className="rounded-full size-8 mr-1 dark:border " src={msg?.sender?.avatar?.url || './avatar-default.svg'} alt="" />
            </div>
            <div className="w-full text-left">
              <strong>{msg?.sender?.username}</strong> {' : '} 
              {/* {moment(msg.createdAt).fromNow()} */}
              {BlockList.has(msg.user) ? (<i>Blocked</i>) :   <RenderPostContent text={msg.message} />}
            </div>
            <div className="relative" onClick={() => toggleSetOptions(i)}>
              <EllipsisVerticalIcon className="text-gray-500 hover:text-gray-700 cursor-pointer size-4 z-0" />
              {openOptions === i && (
                <div className="absolute top-6 right-0 bg-white rounded-lg shadow-lg hover:cursor-pointer space-y-0.5 border border-gray-200 z-50 overflow-hidden text-sm text-black">
                  <div className="hover:bg-slate-200 duration-200 px-2">{BlockList.has(msg.user) ? 'Unblock' : 'Block'}</div>
                  <div className="hover:bg-slate-200 duration-200 px-2">Report</div>
                </div>
              )}
            </div>
          </div>
        )
      }) : null }
    </div>


    <div>
      <button className="absolute bottom-14 right-2 bg-white p-1 rounded-full shadow-lg active:scale-95 duration-200 z-50" onClick={scrollToBottom}>
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

    <div className="p-1 bg-white rounded-t-lg flex absolute top-0 left-0 right-0 z-10 ShadowLight ">
      

    </div>


  </div>
  );
}
// next create superchat ui and add it to the chat
// integerate the payment gateway for it. 