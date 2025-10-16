import {  useEffect, useRef , useState } from "react";
import LiveCard from "./LiveCard";
import LiveChat from "./LiveChats";
import { useGetLiveStreamQuery } from "../../redux/api/api";
import { useSocket } from "../specific/socket";
import { useMediasoupConsumers } from "../specific/broadcast/RecieveBroadcast";
import { useParams } from "react-router-dom";
import VideoPlayer from "../specific/VideoPlayer";
import { StopCircle } from "lucide-react";

export default function WatchLive({localStreamRef , stopBroadcast , isProducer}) {
  const {id} = useParams() ;
  const socket = useSocket() ;

  const [activeStream , setActiveStream] = useState({
    videoStream : localStreamRef?.current?.videoStream || null ,
    audioStream : localStreamRef?.current?.audioStream || null ,
  }) ;
  
   const liveStreams = [
    { id: 1, title: "Morning Coding Stream", host: "Vivek", viewers: 32, thumbnail: "/beach.jpg" },
    { id: 2, title: "React Deep Dive", host: "Aki", viewers: 10, thumbnail: "/beach.jpg" },
  ];
  const videoRef = useRef();
  const {data , error , isError} = useGetLiveStreamQuery({id} , {skip : !id}) ;
  const  { streams, rtcCapabilities, transportRef, init, cleanup , consumersRef } = useMediasoupConsumers(null , socket , true )

  
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
    if(data?.data){
      const videoId = data.data.producers.videoId ;
      const audioId = data.data.producers.audioId ;
      init(videoId , audioId , socket);
      console.log('watch page ', videoId , audioId);
    }
  } , [data , socket])

  return (
    <div className="flex flex-col lg:flex-row h-screen pb-16 sm:pb-0 w-full ">
      <div className=" flex flex-col lg:flex-row w-full justify-center  dark:bg-black h-full">
        {/* This is the mediasoup consumer video */}
        {activeStream && (activeStream.audioStream || activeStream.videoStream) && (
          <div className="w-full h-full">
            <VideoPlayer stream={activeStream?.videoStream} audioStream={activeStream?.audioStream}  />
            <div className="p-2 flex justify-center gap-4 z-50">
              <ControlButton danger={true} label={'Stop Streaming'}></ControlButton>
            </div>
          </div>  
        )}
        <div className="h-full lg:w-1/2 w-full flex"><LiveChat /></div>
      </div>
    {/* <button onClick={startPreview} className="shadowLight w-full px-4 py-2 rounded-xl mb-2  dark:bg-white text-black active:scale-95 ">pre</button> */}
    </div> 
    
  );
}
function ControlButton({ children, label, danger , onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition active:scale-90 ${danger ? 'bg-red-600 text-white' : ' bg-white text-black hover:bg-gray-200'} shadowLight `} 
    >
      {children}
      <span className={`text-[11px] ${danger ? 'text-white' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}
