import {  useEffect, useRef , useState } from "react";
import LiveCard from "./LiveCard";
import LiveChat from "./LiveChats";
import { useGetLiveStreamQuery } from "../../redux/api/api";
import { useSocket } from "../specific/socket";
import { useMediasoupConsumers } from "../specific/broadcast/RecieveBroadcast";
import { NavLink, useParams } from "react-router-dom";
import VideoPlayer from "../specific/VideoPlayer";
import { StopCircle , UserPlus2Icon , UserRoundCheckIcon , BookmarkCheckIcon , BookmarkIcon , Share2Icon, SidebarOpenIcon } from "lucide-react";
import { ensureSocketReady } from "../shared/SharedFun";
import LastRefFunc from '../specific/LastRefFunc'

export default function WatchLive({localStreamRef , stopBroadcast , isProducer , streamData = null}) {
  const {id} = useParams() ;
  const socket = useSocket() ;

  const [SData , setStreamData] = useState(streamData || {}) ;

  const [collapse , setCollapse] = useState(false) ;
  const [activeStream , setActiveStream] = useState({
    videoStream : localStreamRef?.current?.videoStream || null ,
    audioStream : localStreamRef?.current?.audioStream || null ,
  }) ;
  
   const liveStreams = [
    { id: 1, title: "Morning Coding Stream", host: "Vivek", viewers: 32, thumbnail: "/beach.jpg" },
    { id: 2, title: "React Deep Dive", host: "Aki", viewers: 10, thumbnail: "/beach.jpg" },
  ];
  const videoRef = useRef();
  const {data , error , isError , isLoading} = useGetLiveStreamQuery({id : id || SData._id} ) ;
  const  { streams, rtcCapabilities, transportRef, init, cleanup , consumersRef } = useMediasoupConsumers(null , socket , true ) ;

  console.log(streams);
  
  useEffect(() => {
    if(streams.length > 0){
      const videoTrack = streams?.[0]?.track ;
      const audioTrack = streams?.[1]?.track ;
      if(videoTrack || audioTrack){
        let obj = {
          videoStream : videoTrack ? new MediaStream([videoTrack]) : null ,
          audioStream : audioTrack ? new MediaStream([audioTrack]) : null ,
        }
        setActiveStream(obj) ;
        // videoRef.current.srcObject = new MediaStream([videoTrack , audioTrack].filter(Boolean)) ;
        // videoRef.current.play() ;
      }
    }
  } , [streams])

  useEffect(() => {
    const func = async() => {
      if(data?.data){
        setStreamData(data.data) ;
        console.log(data.data);
        await ensureSocketReady(socket);
        socket.emit('join_Socket_Room' , {roomId : data.data._id , room : 'liveStream'}) ;
        
        const videoId = data.data?.producers?.videoId ;
        const audioId = data.data?.producers?.audioId ;
        if(!isProducer)init(videoId , audioId , socket);
        console.log('watch page ', videoId , audioId);
      }
    }
    func() ;
    return () => {
      if(socket) socket.off('Leave_Socket_Room' , {roomId : data?.data?._id , room : 'liveStream'}) ;
    }
  } , [data , socket])

  useEffect(() => {    
    return () => {
      cleanup();
    }
  } , [])

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
                    src={activeStream?.host?.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-gray-700"
                  />
                  <div className="pt-1">
                    <NavLink to={`/profile/${activeStream?.host?.username}`} className="font-semibold hover:underline text-sm  flex ">
                      {activeStream?.host?.name || 'Unknown Streamer'}
                    </NavLink>
                    <p className="text-xs text-gray-400 ">
                      {activeStream?.host?.followersCount ?? 0} followers
                    </p>
                  </div>
                </div>

                {/* Right Side: Buttons */}
                <div className="flex items-center gap-2">
                  {isProducer && <ControlButton danger={true} > Stop Streaming</ControlButton>}
                  {!isProducer && <ControlButton >Follow</ControlButton> }
                  <ControlButton><BookmarkCheckIcon /></ControlButton>
                  <ControlButton ><Share2Icon /></ControlButton>
                  <ControlButton onClick={() => setCollapse(prev => !prev)}><SidebarOpenIcon /></ControlButton>
                </div>
              </div>

              {/* Stream Details */}
              <div>
                <h2 className="text-xl font-bold">
                  {activeStream?.title || 'Live Stream Title'}
                </h2>
                <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  👁️ {activeStream?.viewersCount ?? 0} watching
                </div>
                <p className="mt-2 text-gray-300 text-sm whitespace-pre-wrap">
                  {activeStream?.description || 'No description available.Desciption lorem'} 
                  Reprehenderit placeat vero doloribus rem nesciunt. Fugiat veritatis vitae perferendis dolorum odit nisi natus architecto enim voluptate accusamus, numquam consequuntur rem. Pariatur recusandae fuga quidem animi exercitationem corporis ducimus suscipit.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className={`flex duration-200 ${collapse ? 'w-0 h-0' : 'lg:w-1/2 w-full h-full' } `}>
          {SData?._id && <LiveChat isProducer={isProducer}  streamData={SData} />}
        </div>
      </div>
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
