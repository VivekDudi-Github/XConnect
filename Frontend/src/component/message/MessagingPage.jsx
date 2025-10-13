import { ChevronLeftIcon, Eclipse, EllipsisIcon, EllipsisVerticalIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState , forwardRef} from 'react'
import { useNavigate } from 'react-router-dom'
import { emptyChatName } from '../../redux/reducer/miscSlice';
import { useDispatch, useSelector } from 'react-redux';
import ChatInput from './ChatInput';
import { useSocket } from '../specific/socket';
import moment from 'moment';
import '../../assets/styles.css'

import RenderPostContent from '../specific/RenderPostContent'
import { clearUnreadMessage, storeSocketMessage } from '../../redux/reducer/messageSlice';
import api, { useGetMessagesQuery } from '../../redux/api/api';
import lastRefFunc from '../specific/LastRefFunc';


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
  const socket =  useSocket() ;
  const {user} = useSelector(state => state.auth) ;
  const {byUnreadMessage , byRoom} = useSelector(state => state.messagesBuffer) ;

  const observer = useRef() ;
  const allMessagesIdsRef = useRef(new Set()) ;

  const liveMessagesRef = useRef() ;
  const messagesRef = useRef() ;

  const containerRef = useRef() ;

  const [earliestMessage_id , setEarliestMessage_id ] = useState(null) ;
  
  const [oldChunkMessages , setOldChunkMessages] = useState([]) ;
  const [messages , setMessages] = useState([]) ;
  const [liveMessages , setLiveMessages] = useState([]) ;


  const {title , avatar , username : userIdentifier  , lastOnline , type , _id , room_id } = useSelector(state => state.misc.chatName) ;
  console.log(userIdentifier , _id , room_id);
  
  const {isFetching , isSuccess , isError , data} = useGetMessagesQuery({
    room : room_id ,
    _id : earliestMessage_id ,
    limit : 30} , 
    {skip : !room_id || earliestMessage_id === undefined, 
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false,
    }
  ) ;

  const changeEarliestId = () => {
    setEarliestMessage_id(oldChunkMessages?.[0]?._id)
  }
  
  const topMessageRef = useCallback((node) => {
    lastRefFunc({
      observer , 
      node , 
      page : 2 ,
      fetchFunc : changeEarliestId ,
    })
  } , [oldChunkMessages] )



  useEffect(() => {
    const timeOut = setTimeout(async() => {
      if(room_id){
        let roomMessages = byRoom?.[room_id] || [] ;
        let unreadMessages = byUnreadMessage?.[room_id] || [] ;
        
        
        roomMessages = roomMessages.filter(m => {
          if(!allMessagesIdsRef.current.has(m._id)){
            allMessagesIdsRef.current.add(m._id) ;
            return true ;
          } ;
          return false ;
        }) ;
        unreadMessages = unreadMessages.filter(m => {
          if(!allMessagesIdsRef.current.has(m._id)){
            allMessagesIdsRef.current.add(m._id) ;
            return true ;
          } ;
          return false ;
        }) ;


        setMessages([...roomMessages , ...unreadMessages]) ;

        messagesRef.current = [...roomMessages , ...unreadMessages ] ;
       }
    } , 500)
    
    return () => {
      clearTimeout(timeOut) ;
    }
  } , [])

  useEffect(() => {
    
    return () => {
      dispatch(storeSocketMessage({room_id , messages : [...messagesRef.current , ...liveMessagesRef.current ]})) ;      

      dispatch(clearUnreadMessage(room_id || '')) ;
      setOldChunkMessages([])
      setMessages([]) ;
      setLiveMessages([]) ;
      dispatch(api.util.updateQueryData('getRooms' , undefined , (draft) => {
        const roomDraft = draft.data.find(r => r._id === room_id) ;
        if (roomDraft) {
          roomDraft.unseenMessages = 0 ;
          roomDraft.lastMessage = liveMessagesRef.current[liveMessagesRef.current.length - 1] || roomDraft.lastMessage ;
        }
      }))
      dispatch(emptyChatName()) ;
    }
  } , [])

  useEffect(() => {
    if(isSuccess && data?.data?.length > 0 && data.data[0]._id !== earliestMessage_id){
      const prevScrollHeight = containerRef.current.scrollHeight;
      const prevScrollTop = containerRef.current.scrollTop;
  
      let OldMessages = data.data.filter(m => {
        if(!allMessagesIdsRef.current.has(m._id)){
          allMessagesIdsRef.current.add(m._id) ;
          return true ;
        } ;
        return false ;
      }) ;
      setOldChunkMessages(prev => [...OldMessages , ...prev]) ;
      requestAnimationFrame(() => {
        const newScrollHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
        })
    }
  } , [isSuccess , data]) ;

  useEffect(() => {
    liveMessagesRef.current = liveMessages ;
    requestAnimationFrame(() => {
      containerRef.current.scrollTo({
        top : containerRef.current.scrollTop + 150 ,
        behavior : 'smooth'
      })  
      })
  } , [liveMessages ])
  useEffect(() => {
    messagesRef.current = messages ; 
  } , [messages]) ;

//socket & listener
  useEffect(() => {
    if(!socket) return ;
    const receiveMessageListener = (data) => {
      if(data.room === room_id){

        setLiveMessages(prev => [...prev , data]) ; 
        socket.emit('User_Room_Meta_Update' , {room_id}) ; // update user meta
      }
    }
    socket.on('RECEIVE_MESSAGE' , receiveMessageListener )
    socket.emit('User_Room_Meta_Update' , {room_id}) ; // update user meta
    
    return () => {
      socket.off('RECEIVE_MESSAGE' , receiveMessageListener);
      socket?.emit('User_Room_Meta_Update' , {room_id}) ; // update user meta
    }
  } , [room_id , socket]) ;

  useEffect(() => {
    setTimeout(() => {
      if(!room_id){
        navigate('/messages') ;
      }
    } , 500)
  }, [room_id]) ;


  const BackButton =() => {
    dispatch(emptyChatName()) ;
    navigate(-1) ;
  } ;

  return (
    <div className='dark:text-white  h-screen sm:pb-16 pb-32 text-black '>
      <div className='sticky top-0'>
        <div className='text-white flex items-center gap-2 p-2 w-full border-b-2 border-b-gray-700 '>
          <button onClick={() => BackButton()}><ChevronLeftIcon className='text-black dark:text-white'/></button>
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
              Last Visited • {moment(lastOnline).fromNow()}
            </span>
            </div>
          </div>
        </div>
      </div>
      <MessageBox ref={containerRef} messages={messages} liveMessages={liveMessages} oldChunkMessages={oldChunkMessages} user={user} topMessageRef={topMessageRef} />
      <ChatInput user={user} members={[_id]} setLiveMessages={setLiveMessages} room_id={room_id} />
    </div>
  )
}


const MessageBox =  forwardRef(({messages , liveMessages , oldChunkMessages, user , topMessageRef , isFetching} , ref) => {
  return (
    <div ref={ref} className="flex-1 overflow-y-auto space-y-2 sm:pb-16 pb-16 p-2 h-full duration-200l">
      {isFetching ? (
        <div className='width-full flex justify-center ' ><Loader2Icon className='animate-spin' size={20}/></div>  
        ) : (
        <div></div>
        )}
      {oldChunkMessages.map((msg, i) => {
        let meSender = msg.sender._id === user._id ; 
        return (
        <div key={msg._id} ref={i === 0 ? topMessageRef : null} className={`flex ${meSender ? "justify-end" : "justify-start"}`}>
          <div
            className={`px-4 py-2 fade-in rounded-2xl max-w-xs font-medium text-sm ${
              meSender
                ? "bg-sky-600 text-white"
                : "bg-gray-700 text-gray-100"
            }`}
          >
            <pre className="dark:text-gray-300 font-sans text-wrap"><RenderPostContent text={msg?.message}/></pre>
          </div>
        </div>
      )})}
      {messages.map((msg, i) => {
        let meSender = msg.sender._id === user._id 
        return (
        <div key={msg._id} className={`flex ${meSender ? "justify-end" : "justify-start"}`}>
          <div
            className={`px-4 py-2 fade-in rounded-2xl max-w-xs font-medium text-sm ${
              meSender
                ? "bg-sky-600 text-white"
                : "bg-gray-700 text-gray-100"
            }`}
          >
            <pre className="dark:text-gray-300 font-sans text-wrap"><RenderPostContent text={msg?.message}/></pre>
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
})
