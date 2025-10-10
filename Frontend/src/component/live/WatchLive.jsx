import LiveCard from "./LiveCard";
import LiveChat from "./LiveChats";

export default function WatchLive() {
  // later you’ll fetch stream info from server
   const liveStreams = [
    { id: 1, title: "Morning Coding Stream", host: "Vivek", viewers: 32, thumbnail: "/beach.jpg" },
    { id: 2, title: "React Deep Dive", host: "Aki", viewers: 10, thumbnail: "/beach.jpg" },
  ];
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="flex-1 flex items-center justify-center  dark:bg-black">
        {/* This will be your mediasoup consumer video */}
        <video autoPlay controls className="max-h-full w-full object-contain" />
        <LiveChat />
      </div>
      <div className="w-full lg:w-80 border-l">
        {liveStreams.map((stream) => (
          <LiveCard key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
}

// > layout for watch live page
// >> video player
// >> chats
// >> list of live streams on the right/bottom
// > go live page