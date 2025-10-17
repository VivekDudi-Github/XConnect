import {  useEffect, useRef , useState } from "react";
import LiveCard from "./LiveCard";
import LiveChat from "./LiveChats";
import { useGetLiveStreamQuery } from "../../redux/api/api";
import { useSocket } from "../specific/socket";
import { useMediasoupConsumers } from "../specific/broadcast/RecieveBroadcast";
import { useParams } from "react-router-dom";
import VideoPlayer from "../specific/VideoPlayer";
import { StopCircle , UserPlus2Icon , UserRoundCheckIcon , BookmarkCheckIcon , BookmarkIcon , Share2Icon } from "lucide-react";

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
      <div className="flex flex-col lg:flex-row w-full justify-center  dark:bg-black h-full">
        {/* This is the mediasoup consumer video */}
        {activeStream && (activeStream.audioStream || activeStream.videoStream) && (
          <div className="w-full h-full flex-grow  ">
            <div className="flex-1">
              <VideoPlayer stream={activeStream?.videoStream} audioStream={activeStream?.audioStream}  />
            </div>

            {/* Stream Info Section */}
            <div className="p-4 flex flex-col gap-4  dark:text-white rounded-md shadow-md  flex-1 overflow-y-auto ">
              {/* Profile & Actions */}
              <div className="flex items-center justify-between">
                {/* Left Side: Profile */}
                <div className="flex items-center gap-3">
                  <img
                    src={activeStream?.host?.avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-gray-700"
                  />
                  <div>
                    <a
                      href={activeStream?.host?.profileUrl || '#'}
                      className="font-semibold hover:underline"
                    >
                      {activeStream?.host?.name || 'Unknown Streamer'}
                    </a>
                    <p className="text-sm text-gray-400 ">
                      {activeStream?.host?.followersCount ?? 0} followers
                    </p>
                  </div>
                </div>

                {/* Right Side: Buttons */}
                <div className="flex items-center gap-2">
                  <ControlButton danger={true} > Stop Streaming</ControlButton>
                  {!isProducer && <ControlButton ><UserPlus2Icon /></ControlButton> }
                  <ControlButton><BookmarkCheckIcon /></ControlButton>
                  <ControlButton ><Share2Icon /></ControlButton>
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
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum delectus voluptatem ipsam iste maxime amet explicabo? Facere, animi consequatur excepturi possimus atque praesentium iusto cumque error aspernatur quia at incidunt.
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur at sed ratione earum, totam labore amet temporibus ipsum praesentium explicabo debitis ullam laudantium quasi, inventore impedit eaque et, odit laborum! Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque, voluptas.
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sed, delectus. Autem cupiditate molestias quasi tenetur magnam. Est quia quas maxime doloremque cum delectus ut consequuntur repudiandae sunt, atque perspiciatis omnis.
                  Amet, aspernatur sequi illum ullam quidem laborum repudiandae est odit deleniti architecto omnis provident tenetur reprehenderit expedita voluptatum repellendus commodi dolorem. Minima voluptates, ullam laboriosam dolorem optio excepturi impedit necessitatibus.
                  Ducimus vero harum maiores ipsum molestiae mollitia, enim odit libero blanditiis quis repudiandae eum maxime. Sequi delectus fugiat porro reprehenderit itaque, repudiandae, nihil repellendus minima placeat veniam corporis, rerum facere?
                  Repudiandae numquam, laborum minus distinctio voluptatum quam adipisci deserunt optio velit sit, dolore deleniti sunt ut recusandae nemo atque? Iusto officiis tempora deserunt sunt quaerat, veritatis aperiam cumque necessitatibus earum?
                  Tenetur facere necessitatibus delectus recusandae, dignissimos voluptas soluta maxime. Quod, autem quisquam eveniet repellendus quaerat et odio numquam iure facilis provident esse doloribus, ea magni reiciendis est suscipit, aliquid enim.
                  Quas dolore nihil inventore veniam soluta. Assumenda cupiditate architecto quis rerum maxime possimus optio repellendus blanditiis repudiandae nisi est reprehenderit ab earum rem iure minima, consequatur voluptates? Mollitia, facere soluta!
                  Facere obcaecati nisi sapiente, voluptatem assumenda nam repellat illo eligendi consequatur eos delectus nihil, cumque, officiis corporis. Labore, tenetur dolores modi delectus natus necessitatibus vitae sapiente asperiores voluptas. Rerum, nostrum!
                  Soluta, suscipit commodi facere ipsam assumenda et eaque consectetur, molestias ea dolore iure sapiente incidunt quisquam. Velit id ducimus, ut voluptates dicta quia neque at praesentium dolorem obcaecati explicabo reprehenderit?
                  Ullam ea quaerat assumenda illo reiciendis quas iure voluptatum enim commodi, aliquid quo, in ipsa accusamus totam consequatur modi facere dolore dolor odit temporibus magnam! Impedit mollitia cumque necessitatibus recusandae?
                  Reprehenderit placeat vero doloribus rem nesciunt. Fugiat veritatis vitae perferendis dolorum odit nisi natus architecto enim voluptate accusamus, numquam consequuntur rem. Pariatur recusandae fuga quidem animi exercitationem corporis ducimus suscipit.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className=" h-full lg:w-1/2 w-full flex  "><LiveChat /></div>
      </div>
    </div> 
    
  );
}
function ControlButton({ children, label, danger , onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-1 py-1 rounded-lg shadow-sm hover:shadow-md transition active:scale-90 ${danger ? 'bg-red-600 text-white' : ' bg-white text-black hover:bg-gray-200'} shadowLight `} 
    >
      {children}
      <span className={`text-[11px] ${danger ? 'text-white' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}
