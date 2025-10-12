import { useRef } from "react";
import LiveCard from "./LiveCard";
import LiveChat from "./LiveChats";

export default function WatchLive({localStreamRef , stopBroadcast}) {
  // later you’ll fetch stream info from server
   const liveStreams = [
    { id: 1, title: "Morning Coding Stream", host: "Vivek", viewers: 32, thumbnail: "/beach.jpg" },
    { id: 2, title: "React Deep Dive", host: "Aki", viewers: 10, thumbnail: "/beach.jpg" },
  ];

  const videoRef = useRef() ;

  const startPreview = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream ;
  };
  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <div className=" flex flex-col lg:flex-row items-stretch justify-center  dark:bg-black h-full">
        {/* This will be your mediasoup consumer video */}
        <video autoPlay ref={videoRef} controls className="max-h-full w-full object-contain" />
        <div className="flex flex-col h-fit"><LiveChat /></div>
      </div>
      {/* <div className="w-full lg:w-80 border-l">
        {liveStreams.map((stream) => (
          <LiveCard key={stream.id} stream={stream} />
        ))}
      </div> */}
    {/* <button onClick={startPreview} className="shadowLight w-full px-4 py-2 rounded-xl mb-2  dark:bg-white text-black active:scale-95 ">pre</button> */}
    </div>
  );
}

// > layout for watch live page
// >> video player
// >> chats
// >> list of live streams on the right/bottom
// > go live page