import {  useEffect, useRef , useState } from "react";
import LiveCard from "./LiveCard";
import LiveChat from "./LiveChats";
import { useGetLiveStreamQuery } from "../../redux/api/api";
import { useSocket } from "../specific/socket";
import { useMediasoupConsumers } from "../specific/broadcast/RecieveBroadcast";
import { useParams } from "react-router-dom";
import VideoPlayer from "../specific/VideoPlayer";


export default function WatchLive({localStreamRef , stopBroadcast}) {
  // later you’ll fetch stream info from server
  const {id} = useParams() ;
  const socket = useSocket() ;
  
   const liveStreams = [
    { id: 1, title: "Morning Coding Stream", host: "Vivek", viewers: 32, thumbnail: "/beach.jpg" },
    { id: 2, title: "React Deep Dive", host: "Aki", viewers: 10, thumbnail: "/beach.jpg" },
  ];

  const videoRef = useRef() ;
  const {data , error , isError} = useGetLiveStreamQuery({id} , {skip : !id}) ;
  const  { streams, rtcCapabilities, transportRef, init, cleanup , consumersRef } = useMediasoupConsumers(null , socket , true )

  const startPreview = async () => {
    let stream ;
    if(localStreamRef?.current && !id){
      let audio =  localStreamRef.current.audioStream ;
      let video =  localStreamRef.current.videoStream ;
      stream = new MediaStream([ ...video.getVideoTracks() , ...audio.getAudioTracks() ]) ;
      videoRef.current.srcObject = stream ;
    }
  };
  
  useEffect(() => {
    startPreview();
  }, []);

  useEffect(() => {
    if(streams.length > 0){
      const videoTrack = streams?.[0]?.track ;
      const audioTrack = streams?.[1]?.track ;
      if(videoTrack || audioTrack){
        let stream = new MediaStream() ;
        console.log(videoTrack);
        if(videoTrack) stream.addTrack(videoTrack) ;
        if(audioTrack) stream.addTrack(audioTrack) ;
        videoRef.current.srcObject = stream  ;
      }
    }
  } , [streams])

  useEffect(() => {
    if(data?.data){
      const videoId = data.data.producers.videoId ;
      const audioId = data.data.producers.audioId ;
      init(videoId , audioId);
      console.log('watch page ', videoId , audioId);
    }
  } , [data])

  return (
    <div className="flex flex-col lg:flex-row h-screen pb-16 sm:pb-0 w-full ">
      <div className=" flex flex-col lg:flex-row w-full justify-center  dark:bg-black h-full">
        {/* This will be the mediasoup consumer video */}
        <video autoPlay ref={videoRef} muted controls className="max-h-full w-full object-contain" />
        <div className="h-full w-full flex"><LiveChat /></div>
      </div>
    {/* <button onClick={startPreview} className="shadowLight w-full px-4 py-2 rounded-xl mb-2  dark:bg-white text-black active:scale-95 ">pre</button> */}
    </div> 
    
  );
}

// > layout for watch live page
// >> video player
// >> chats
// >> list of live streams on the right/bottom
// > go live page





// export default function WatchLive({localStreamRef , stopBroadcast}) {
//   const {id} = useParams() ;
//   const socket = useSocket() ;

//   const [activeStream , setActiveStream] = useState({
//     videoStream : localStreamRef?.current?.videoStream || null ,
//     audioStream : localStreamRef?.current?.audioStream || null ,
//   }) ;
  
//    const liveStreams = [
//     { id: 1, title: "Morning Coding Stream", host: "Vivek", viewers: 32, thumbnail: "/beach.jpg" },
//     { id: 2, title: "React Deep Dive", host: "Aki", viewers: 10, thumbnail: "/beach.jpg" },
//   ];
//   const videoRef = useRef();
//   const {data , error , isError} = useGetLiveStreamQuery({id} , {skip : !id}) ;
//   const  { streams, rtcCapabilities, transportRef, init, cleanup , consumersRef } = useMediasoupConsumers(null , socket , true )

  
//   useEffect(() => {
//     if(streams.length > 0){
//       const videoTrack = streams?.[0]?.track ;
//       const audioTrack = streams?.[1]?.track ;
//       if(videoTrack || audioTrack){
//         // let obj = {
//         //   videoStream : videoTrack ? new MediaStream([videoTrack]) : null ,
//         //   audioStream : audioTrack ? new MediaStream([audioTrack]) : null ,
//         // }
//         // setActiveStream(obj) ;
//         videoRef.current.srcObject = new MediaStream([videoTrack , audioTrack].filter(Boolean)) ;
//         // videoRef.current.play() ;
//       }
//     }
//   } , [streams])

//   useEffect(() => {
//     if(data?.data){
//       const videoId = data.data.producers.videoId ;
//       const audioId = data.data.producers.audioId ;
//       init(videoId , audioId , socket);
//       console.log('watch page ', videoId , audioId);
//     }
//   } , [data , socket])

//   return (
//     <div className="flex flex-col lg:flex-row h-screen pb-16 sm:pb-0 w-full ">
//       <div className=" flex flex-col lg:flex-row w-full justify-center  dark:bg-black h-full">
//         {/* This will be the mediasoup consumer video */}
//         {activeStream && (activeStream.audioStream || activeStream.videoStream) && (
//           <VideoPlayer stream={activeStream?.videoStream} audioStream={activeStream?.audioStream}  />  
//         )}
//         <video ref={videoRef} controls className="max-h-full w-full object-contain" />
//         <div className="h-full w-full flex"><LiveChat /></div>
//       </div>
//     {/* <button onClick={startPreview} className="shadowLight w-full px-4 py-2 rounded-xl mb-2  dark:bg-white text-black active:scale-95 ">pre</button> */}
//     </div> 
    
//   );
// }
