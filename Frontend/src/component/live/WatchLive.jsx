import {  useEffect, useRef , useState } from "react";
import LiveCard from "./LiveCard";
import LiveChat from "./LiveChats";
import { useGetLiveStreamQuery, useGetProfileQuery } from "../../redux/api/api";
import { useSocket } from "../specific/socket";
import { useMediasoupConsumers } from "../specific/broadcast/RecieveBroadcast";
import { NavLink, useParams } from "react-router-dom";
import VideoPlayer from "../specific/videPlayer/LiveVideoPlayer";
import { StopCircle , UserPlus2Icon , UserRoundCheckIcon , BookmarkCheckIcon , BookmarkIcon , Share2Icon, SidebarOpenIcon } from "lucide-react";
import { ensureSocketReady } from "../shared/SharedFun";
import LastRefFunc from '../specific/LastRefFunc'
import DialogBox from "../shared/DialogBox";
import { useDispatch } from "react-redux";
import { setisDeleteDialog } from "../../redux/reducer/miscSlice";
import { toast } from "react-toastify";

export default function WatchLive({localStreamRef , stopBroadcast , isProducer , streamData = null}) {
  const {id} = useParams() ;
  const socket = useSocket() ;
  const dispatch = useDispatch() ;

  const intervalRef = useRef(null) ;

  const [isJoined , setIsJoined] = useState(true) ;
  const [SData , setStreamData] = useState(streamData || {}) ;

  const [collapse , setCollapse] = useState(false) ;
  const [viewersCount , setViewersCount] = useState(0) ;
  const [activeStream , setActiveStream] = useState({
    videoStream : localStreamRef?.current?.videoStream || null ,
    audioStream : localStreamRef?.current?.audioStream || null ,
  }) ;
  
  const {data , error , isError , isLoading} = useGetLiveStreamQuery({id : id ?? SData._id} ) ;
  const  { streams, rtcCapabilities, transportRef, init, cleanup , consumersRef } = useMediasoupConsumers(null , socket , true ) ;

  
  useEffect(() => {
    if(streams.length > 0){
      const videoTrack = streams?.[0]?.track ;
      const audioTrack = streams?.[1]?.track ;
      if(videoTrack || audioTrack){
        console.log('stream updated');
        
        let obj = {
          videoStream : videoTrack ? new MediaStream([videoTrack]) : null ,
          audioStream : audioTrack ? new MediaStream([audioTrack]) : null ,
        }
        setActiveStream(obj) ;
      }
    }
  } , [streams])

  useEffect(() => {
    let interval ;
    if(intervalRef.current) clearInterval(intervalRef.current) ;
    if(socket){
      interval = setInterval(() => {
        socket.emit('CHECK_ROOM_ACTIVE' , {room : 'liveStream' , roomId : data?.data?._id} , (res) => {
          setViewersCount(res.active) ;
          if(!isProducer && !res.isRoom ){setActiveStream(null) } ;
        }) ;
        if(isProducer){
          socket.emit('CHECK_ROOM_JOINED', {room : 'liveStream' , roomId : data?.data?._id} , (res) => {
            if(!res) toast.info('You are currently got disconnected from the stream , rejoining...');
            if(!res) setIsJoined(false) ;
          }) ;
        }
      } , 1000 * 2 )
    }
    intervalRef.current = interval ;
    const func = async() => {
      if(data?.data){
        setStreamData(data.data) ;
        console.log(data.data);
        await ensureSocketReady(socket);
        socket.emit('JOIN_SOCKET_ROOM' , {roomId : data.data._id , room : 'liveStream'}) ;
        
        const videoId = data.data?.producers?.videoId ;
        const audioId = data.data?.producers?.audioId ;
        console.log('init ref:' )
        if(!isProducer)init(videoId , audioId , socket);
      }
    }
    func() ;
    return () => {
      if(socket) socket.emit('LEAVE_SOCKET_ROOM' , {roomId : data?.data?._id , room : 'liveStream'}) ;
      if(intervalRef.current) clearInterval(intervalRef.current) ;
    }
  } , [data , socket])


  useEffect(() => {
    if(!socket) return ;
    const getNewStreamData = async(data) => {
      setStreamData(data) ;
      console.log('new live stream data' , data);
      
      if(!isProducer){
        const videoId = data?.producers?.videoId ;
        const audioId = data?.producers?.audioId ;
        await ensureSocketReady(socket);
        console.log('init ref:');

        init(videoId , audioId , socket) ;
      }
    }
    socket.on('RECEIVE_LIVE_STREAM_DATA' , getNewStreamData) ;

    return () => {
      socket.off('RECEIVE_LIVE_STREAM_DATA' , getNewStreamData) ;
    }
  } , [socket , init])

  useEffect(() => {
    if(!isJoined){
      socket.emit('REJOIN_LIVE_STREAM' , {roomId : data?.data?._id} , async(res) => {
        if(res) setIsJoined(true) ;
    })
  }} , [isJoined , socket]) ;

  useEffect(() => {    
    return () => {
      cleanup();
    }
  } , [])

  useEffect(() => {
    if(isError){
      console.log('error fetching live stream data' , error);
      toast.error(error?.data?.message || 'Error fetching live stream data') ;
    }
  } , [isError , error])

  const leaveStream = async() => {
    if(socket) socket.emit('LEAVE_SOCKET_ROOM' , {roomId : data?.data?._id , room : 'liveStream'}) ; 
  } 


  return (
    <div className="flex flex-col lg:flex-row h-screen pb-16 sm:pb-0 w-full ">
      <div className="flex flex-col lg:flex-row w-full justify-center  dark:bg-black h-full">
        {/* This is the mediasoup consumer video */}
        {activeStream && (activeStream.audioStream || activeStream.videoStream) && (
          <div className="w-full h-full flex-grow  overflow-y-scroll ">
            <div className="flex-1">
              <VideoPlayer stream={activeStream?.videoStream} audioStream={activeStream?.audioStream}  />
            </div>

            {/* Stream Info Section */}
            <div className="p-4 flex flex-col gap-4  dark:text-white rounded-md shadow-md  flex-1 overflow-y-auto ">
              {/* Profile & Actions */}
              <div className="flex items-center gap-3 justify-between overflow-auto">
                {/* Left Side: Profile */}
                <div className="flex items-center gap-3">
                  <img
                    src={SData?.host?.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-gray-700"
                  />
                  <div className="pt-1">
                    <NavLink to={`/profile/${activeStream?.host?.username}`} className="font-semibold hover:underline text-sm  flex ">
                      {SData?.hostName || 'Unknown Streamer'}
                    </NavLink>
                    <p className="text-xs text-gray-400 ">
                      {SData.followers ?? 0} followers
                    </p>
                  </div>
                </div>

                {/* Right Side: Buttons */}
                <div className="flex items-center gap-2">
                  {isProducer && <ControlButton danger={true} onClick={() => dispatch(setisDeleteDialog(true))} > Stop Streaming</ControlButton>}
                  {!isProducer && <ControlButton >Follow</ControlButton> }
                  <ControlButton><BookmarkCheckIcon /></ControlButton>
                  <ControlButton ><Share2Icon /></ControlButton>
                  <ControlButton onClick={() => setCollapse(prev => !prev)}><SidebarOpenIcon /></ControlButton>
                </div>
              </div>

              {/* Stream Details */}
              <div>
                <h2 className="text-xl font-bold">
                  {SData?.title || 'Live Stream Title'}
                </h2>
                <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  👁️ {viewersCount ?? 0} watching
                </div>
                <p className="mt-2 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {SData?.description || 'No description available.Desciption lorem'} 
                </p>
              </div>
            </div>
          </div>
        )}
        <div className={`flex duration-200 ${collapse ? 'w-0 h-0' : 'lg:w-1/2 w-full h-full' } `}>
          {SData?._id && <LiveChat isProducer={isProducer}  streamData={SData} />}
        </div>
      </div>
      {/* <DialogBox message="Are you sure you want to stop streaming?" onClose={() => dispatch(setisDeleteDialog(false))} mainFuction={leaveStream} /> */}
    </div> 
    
  );
}
function ControlButton({ children, label, danger , onClick }) {
  return (
    <button
      onClick={onClick}
      className={`  items-center text-xs justify-center gap-1 px-1 py-1 rounded-lg  transition active:scale-90 ${danger ? 'bg-red-600 text-white' : ' bg-white text-black hover:bg-gray-200'} shadowLight `} 
    >
      {children}
      <span className={`sm:text-[11px] ${danger ? 'text-white' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}
