import { useEffect, useState } from 'react';
import { Video, Users, MessageCircle, Phone, Mic, Video as VideoIcon, Share2, Settings, X, MicOff, PhoneCall , ChevronRight, ChevronLeft } from 'lucide-react';
import '../../assets/styles.css'
import { useSocket } from '../specific/socket';
import { useMediasoupConsumers } from '../specific/broadcast/RecieveBroadcast';
import VideoPlayer from '../specific/VideoPlayer';



export default function MeetingPage({roomId}) {  
  const socket = useSocket();


  const [participants , setParticipants] = useState( new Map());
  const [view, setView] = useState('grid'); // grid | spotlight

  const [activeSidebar, setActiveSidebar] = useState("chat"); // "chat" | "participants"
  const [collapsed, setCollapsed] = useState(false);



  const { streams, rtcCapabilities, transportRef, init , cleanup } = useMediasoupConsumers(roomId, socket);

  useEffect(() => {
    init() ;
    return () => cleanup();
  } , [init , cleanup])

  useEffect(() => {
    setParticipants(prev => {
      const updated = new Map();

      streams.forEach(s => {
        const existing = prev.get(s.user.userId);
        updated.set(s.user.userId, {
          username: s.user.username,
          muted: existing ? existing.muted : false // preserve mute state if already present
        });
      });

      return updated;
    });
  }, [streams]);

  const toggleMute = (userId) => {
    setParticipants(prev => {
      const updated = new Map(prev);
      const user = updated.get(userId);

      if (user) {
        const newMuted = !user.muted;
        updated.set(userId, { ...user, muted: newMuted });

        // Find audio consumer in streams
        const userStream = streams.find(s => s.user.userId === userId);
        if (userStream) {
          userStream.producers
            .filter(p => p.kind === "audio" && p.consumer)
            .forEach(p => {
              if (newMuted) {
                p.consumer.pause();   // stop receiving audio
              } else {
                p.consumer.resume();  // resume receiving audio
              }
            });
        }
      }

      return updated;
    });
  };


  function bundleUserStream(producers) {
    const mediaStream = new MediaStream();
    const audioStream = new MediaStream();
    producers.forEach(p => {
      if (p.track && p.kind === 'video') {
        mediaStream.addTrack(p.track);
      } else if (p.track && p.kind === 'audio') {
        audioStream.addTrack(p.track);
      }
    });
    return {mediaStream , audioStream};
  }


  return (
    <div className={`min-h-screen flex gap-4 p-6  dark:bg-gradient-to-t to-slate-900 from-gray-900 text-white`}> 
      
      {/* Left sidebar */}
      
      <aside className={` flex overflow-clip backdrop-blur-sm filter dark:bg-black rounded-2xl  flex-col gap-4 ${collapsed ? 'w-10 p-0' : 'w-3/12 min-w-56 p-4'} duration-300`}> 
        {/* Side Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveSidebar("chat")}
            className={`flex-1 py-2 rounded-lg
              ${ collapsed ? 'hidden' : ''} 
              ${ activeSidebar === "chat"
                ? "bg-slate-700 text-slate-300"
                : " shadowLight"
            }`}>
            Chat
          </button>
          <button
            onClick={() => setActiveSidebar("participants")}
            className={`flex-1 py-2 rounded-lg 
              ${ collapsed ? 'hidden' : ''} 
              ${ activeSidebar === "participants"
                ? "bg-slate-700 text-slate-300"
                : " shadowLight"
            }`}>
            Participants
          </button>
          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md bg-slate-700 text-white p-2" >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>


        {/* Right chat / notes */}
        {activeSidebar === "chat" && (
          <aside className={` dark:text-white text-black bg-slate-800 rounded-2xl  shadow-sm flex flex-col shadowLight ${collapsed ? 'overflow-x-hidden  p-0 w-0' : 'w-full p-4'}`}>
          
            <div className="flex items-center text-black dark:text-white justify-between w-full">
              <div className="text-lg font-semibold ">Chat & Notes</div>
              <MessageCircle className="w-5 h-5 text-slate-400" />
            </div>

            <div className="flex-1 mt-3 overflow-auto space-y-3  fade-in text-white">
              <div className="text-xs text-slate-500">09:10 • Neon</div>
              <div className="bg-slate-700 p-3 rounded-lg text-sm">Please check the slide deck I shared.</div>
              <div className="text-xs text-slate-500">09:12 • You</div>
              <div className="bg-indigo-600/30 p-3 rounded-lg text-sm">On it — switching to screen share.</div>
            </div>

            <div className="mt-3 flex sm:flex-row flex-wrap flex-col gap-2">
              <input className=" rounded-lg border border-slate-700 bg-slate-900 text-white px-3 py-2 w-full" placeholder="Send a message..." />
              <button className="px-3 py-2 rounded-lg w-full bg-indigo-600 text-white">Send</button>
            </div>
          </aside>  
        )}
        
        {/* Participants */}
        {activeSidebar === "participants" && (
          <aside className={`flex flex-col gap-4  shadowLight ${collapsed ? 'w-0 overflow-x-hidden p-0' : 'w-full p-4'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold dark:text-white text-black">Participants</h3>
              <div className="text-sm text-slate-400">{streams?.length || 0}</div>
            </div>

            <div className="flex-1 overflow-auto space-y-2">
              {/* {participants.forEach((v , k) => {  
                  
                  return <ParticipantCard key={k} name={v.username} muted={v.muted} userId={k} toggleMute={toggleMute} />
                })} */}
            <ParticipantCard name={'Ravi'} muted={false} userId={'1'} toggleMute={toggleMute} />
            <ParticipantCard name={'You'} muted={false} userId={'2'} toggleMute={toggleMute} />
            <ParticipantCard name={'John'} muted={false} userId={'3'} toggleMute={toggleMute} />
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300">Invite</button>
              <button className="py-2 px-3 rounded-lg bg-indigo-600 text-white">Settings</button>
            </div>
          </aside>
        )}
      </aside>
  
      {/* Main video area */}
      <main className={` flex flex-col gap-4 w-full ${collapsed ? '' : ' w-full'} `} >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Meeting Room</h2>
          <div className="flex gap-2">
            <button onClick={() => setView('grid')} className={`px-3 py-1  rounded-md ${view==='grid' ? 'bg-slate-700 text-slate-300 ' : 'shadowLight'}`}>Grid</button>
            <button onClick={() => setView('spotlight')} className={`px-3 py-1 rounded-md ${view==='spotlight' ? 'bg-slate-700 text-slate-300' : 'shadowLight'}`}>Spotlight</button>
          </div>
        </div>

        {view === 'spotlight' ? (
          <div className="rounded-2xl bg-black aspect-video flex items-center justify-center text-white relative overflow-hidden">
            <div className="absolute left-4 top-4 p-2 bg-black/60 rounded-md text-sm">Live • Spotlight View</div>
              <VideoPlayer stream={streams[0].mediaStream} audioStream={streams[0].audioStream} />
            
            {/* <div className="text-center">
              <Video className="mx-auto w-16 h-16 opacity-80" />
              <div className="mt-2 text-lg font-semibold">Presenter: Ravi</div>
              <div className="text-sm text-slate-400 mt-1">Screen sharing — 720p</div>
            </div> */}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {streams.map((p, i) => {
              const {mediaStream , audioStream} = bundleUserStream(p.producers);
              return (
              <div key={p.user.userId } className="rounded-lg bg-black aspect-video flex items-center justify-center  border-slate-700">
                <VideoPlayer stream={mediaStream} audioStream={audioStream} />
                {/* <div className="text-center">
                  <div className="w-14 h-14 bg-slate-600 rounded-full mb-2 flex items-center justify-center text-white font-bold">{p.name[0]}</div>
                  <div className="text-sm font-medium">{p.name}</div>
                </div> */}
              </div>
            )})}

            {/* {streams.map((s , i) => {
        const {mediaStream , audioStream} = bundleUserStream(s.producers);
        console.log(mediaStream?.active , audioStream?.active , 'bundled stream');
        
        return (
          <div className="flex flex-col gap-8" key={i}>
            <h3>User : {s.user.username}</h3>
            
            <VideoPlayer stream={mediaStream} audioStream={audioStream} />
          </div>
          )
        })
      } */}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <ControlButton>
            <Mic />
          </ControlButton>
          <ControlButton>
            <VideoIcon />
          </ControlButton>
          <ControlButton danger>
            <Phone />
          </ControlButton>
          <ControlButton>
            <Share2 />
          </ControlButton>
        </div>
      </main>
    </div>
  );
}


function ParticipantCard({ name, muted , userId , toggleMute }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border-2 border-cyan-400 custom-box fade-in">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">{name[0]}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-black dark:text-white truncate">{name}</div>
        <div className="text-xs text-slate-400">{muted ? 'Muted' : 'Active'}</div>
      </div>
      <button className=' pr-1' onClick={() => toggleMute(userId)}>
        {muted ? <MicOff className="w-4 h-4 text-slate-400" /> : <Mic className="w-4 h-4 text-slate-400" />}
      </button>
    </div>
  );
}

function ControlButton({ children, label, danger }) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition active:scale-75 ${danger ? 'bg-red-600 text-white' : ' bg-white text-black hover:bg-gray-200'} shadowLight `} 
    >
      {children}
      <span className={`text-[11px] ${danger ? 'text-white' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}



