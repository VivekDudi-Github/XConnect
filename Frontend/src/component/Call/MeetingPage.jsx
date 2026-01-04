import { useEffect, useState } from 'react';
import { MessageCircle, Phone, Mic, Video as VideoIcon, Share2, Settings, X, MicOff , ChevronRight, ChevronLeft, MonitorIcon, MonitorCheckIcon, VideoOffIcon } from 'lucide-react';
import '../../assets/styles.css'
import { useSocket } from '../specific/socket';
import { useMediasoupConsumers } from '../specific/broadcast/RecieveBroadcast';
import VideoPlayer from '../specific/videPlayer/LiveVideoPlayer';
import { toast } from 'react-toastify';
import moment from 'moment' ;
import {useSelector} from 'react-redux'
import Textarea from 'react-textarea-autosize'

export default function MeetingPage({roomId , stopBroadcast , audioproducer ,videoProducer ,localStreamRef}) {  
  const socket = useSocket();
  const auth = useSelector(state => state.auth) ;

  const [participants , setParticipants] = useState( new Map());
  
  const [view, setView] = useState('spotlight'); // grid | spotlight

  const [activeSidebar, setActiveSidebar] = useState("chat"); // "chat" | "participants"
  const [collapsed, setCollapsed] = useState(false);
  const [cameraOn , setCameraOn] = useState(true);
  const [message , setMessage] = useState('');
  
  const [isMuted , setIsMuted] = useState(audioproducer?.paused );
  const [isVideoPaused , setIsVideoPaused] = useState(videoProducer?.paused);

  const [activeStream , setActiveStream] = useState({
    user : 'You',  
    audioStream : localStreamRef.current.audioStream ,
    videoStream : localStreamRef.current.videoStream ,
    consumer : null 
  }); 

  const { streams, chats , rtcCapabilities, transportRef, init , cleanup , consumersRef} = useMediasoupConsumers(roomId, socket);
  
  const handleAddMessage = () => {
    socket.emit('addMessage' , { message , roomId } , ({error}) => {
      if(error) return toast.error(error);
      setMessage('');
    })}
  
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
      console.log(updated , streams);
      
      return updated;
    });
    
  }, [streams]);


  const toggleMute = (userId) => {
    if(!audioproducer &&  userId == 'You') {
      setIsMuted(true);
      return ;
    }
    if(userId == 'You' && audioproducer ) {
      if(isMuted){
        audioproducer.resume();
        setIsMuted(false);
      }else {
        audioproducer.pause();
        setIsMuted(true);
      }
      return ;
    } ;
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

  const changeActiveStream = async(username) => {
    if(activeStream.user.username === username) return ;

    if(activeStream.consumer && view === 'spotlight'){
      for (const c of activeStream.consumer ?? []) {
        const consumer = consumersRef.current?.get(c);
        if (consumer && !consumer.paused) await consumer.pause();
      }
    }

    if(username === 'You') return setActiveStream({
      user : 'You',
      audioStream : localStreamRef.current.audioStream , 
      videoStream : localStreamRef.current.videoStream ,
      consumer : null ,
    });

    const user = streams.find(s => s.user.username === username) ;
    if(!user) {
      toast.error('User not found');
      return ;
    } ;
    const {mediaStream , audioStream} = bundleUserStream(user.producers);
    const consumerIds = user.producers.map(p => p.consumer) ;
    
    for (const c of consumerIds) {
      const consumer = consumersRef.current?.get(c);
      if (consumer && consumer.paused) await consumer.resume();
    }

    setActiveStream({
      user : user.user.username , 
      audioStream : audioStream , 
      videoStream : mediaStream ,
      consumer : consumerIds ,
    })
  }

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

  const changeVideoSource = async() => {
    if(!videoProducer) return ;
      let stream ;
      if(cameraOn){
        stream = await navigator.mediaDevices.getDisplayMedia({ video : true , audio : false })
      }else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) 
      }
      let oldTrack  = videoProducer.track ;
      let newTrack = stream.getVideoTracks()[0];
      if(oldTrack) oldTrack.stop();
      await videoProducer.replaceTrack({ track: newTrack });
      if(oldTrack) oldTrack.stop();
      localStreamRef.current.removeTrack(oldTrack);
      localStreamRef.current.addTrack(newTrack);  
      setCameraOn(!cameraOn);
  }

  const pauseVideoSource = async() => {
    if(!videoProducer) return ;
    if(isVideoPaused) {
      await videoProducer.resume();
      setIsVideoPaused(false);
    }else {
      await videoProducer.pause();
      setIsVideoPaused(true);
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.info('Room ID copied to clipboard');
  }

  const pauseAll  = (consumerId) => {
    if(activeStream?.consumer && view === 'spotlight'){
      consumersRef.current.forEach(async (c , id ) => {
        if(consumerId && consumerId.includes(id)) {
          c.resume() ;
          return ;
        } 
        if(!consumerId && activeStream.consumer.includes(id) ) {
          c.resume() ;
          return ;
        }
        c.pause();
      })
    }
  }

  const resumeAll = () => {
    consumersRef.current.forEach( async (c) => {
      await c?.resume() ;
    })
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

            {/* chats */}
            <div className="flex-1 mt-3 overflow-auto space-y-3  fade-in text-white">
              {chats.map((c , i) => {
                return (
                  <>
                    <div key={c?.id} className="text-xs text-slate-500">{moment(c?.timeStamp).fromNow()} • {c?.user?.username}</div> 
                    {c.user?.username === auth?.user?.username ? (
                      <div className="bg-slate-700 p-3 rounded-lg text-sm">{c?.message}</div>
                    ) : (
                    <div className="bg-indigo-600/30 p-3 rounded-lg text-sm">{c?.message}</div>
                    )}
                  </>
                )
              })}
            </div>

            <div className="mt-3 flex sm:flex-row flex-wrap flex-col gap-2">
              <Textarea onChange={(e) => setMessage(e.target.value)} value={message}
                className=" w-full p-1 focus:pl-3 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight" 
                placeholder="Send a message..."
              />
              <button onClick={handleAddMessage} className="px-3 py-2 rounded-lg w-full bg-indigo-600 text-white">Send</button>
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
              <ParticipantCard name={'You'} muted={isMuted} userId={'You'} changeActive={changeActiveStream} toggleMute={toggleMute} /> 
              {[...participants.entries()].map(([k, v]) => (
                <ParticipantCard
                  key={k}
                  name={v.username}
                  muted={v.muted}
                  userId={k}
                  toggleMute={toggleMute}
                  changeActive={changeActiveStream}
                />
              ))} 
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
          <h2 className="text-lg font-semibold flex">Meeting Room
            <div className='ml-3 text-xs text-slate-400'>{roomId}</div>
          </h2>
          <div className="flex gap-2">
            <button onClick={() => {
              setView('grid');
              resumeAll() ;
            }} className={`px-3 py-1  rounded-md ${view==='grid' ? 'bg-slate-700 text-slate-300 ' : 'shadowLight'}`}>Grid</button>
            <button onClick={() => {
              setView('spotlight');
              pauseAll() ;
            }} className={`px-3 py-1 rounded-md ${view==='spotlight' ? 'bg-slate-700 text-slate-300' : 'shadowLight'}`}>Spotlight</button>
          </div>
        </div>

        {view === 'spotlight' ? (
          <div className="rounded-2xl bg-black aspect-video flex items-center justify-center text-white relative overflow-hidden">
            <VideoPlayer stream={activeStream?.videoStream} audioStream={activeStream?.audioStream}  />  
              <div className="absolute left-1 top-1 p-1 bg-black/60 rounded-md text-sm text-white">Live {activeStream?.user} • Spotlight View</div> 
            
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <VideoPlayer stream={localStreamRef.current.videoStream} audioStream={localStreamRef.current.audioStream} />
            {streams.map((p, i) => {
              const {mediaStream , audioStream} = bundleUserStream(p.producers);
                p.producers.forEach(async (p) => {
                  try {
                    await consumersRef.current.get(p.consumer)?.resume() ;
                  } catch (error) {
                    console.log(error);
                  }
                })

              return (
              <div key={p.user.userId } className="rounded-lg bg-black aspect-video flex items-center justify-center relative border-slate-700">
                <VideoPlayer stream={mediaStream} audioStream={audioStream} />
                {!mediaStream ? (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-slate-600 rounded-full mb-2 flex items-center justify-center text-white font-bold">{p?.user?.username}</div>
                    <div className="text-sm font-medium">{p?.user?.muted}</div>
                  </div>
                ) : (
                  <div className="absolute flex top-1 left-1 p-1 py-0.5 bg-white rounded-lg">
                    <div className=" flex items-center justify-center text-black font-bold text-sm">{p?.user?.username}</div>
                    {/* <select className='p-1 bg-white text-black'>
                      <option value="low" onClick={() => consumer.setPreferredLayers({ spatialLayer: 0 , temporalLayer : 0 })}>180p</option>
                      <option value="med" onClick={() => consumer.setPreferredLayers({ spatialLayer: 1 , temporalLayer : 0 })}>360p</option>
                      <option value="high" onClick={() => consumer.setPreferredLayers({ spatialLayer: 2 , temporalLayer : 0 })}>720p</option>
                    </select> */}
                  </div>
                ) }
              </div>
            )})}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <ControlButton onClick={() => toggleMute('You')}>
            {isMuted ? <MicOff /> : <Mic />}
          </ControlButton>
          <ControlButton onClick={() => pauseVideoSource()}>
            {isVideoPaused ? <VideoOffIcon /> : <VideoIcon />}  
          </ControlButton>
          <ControlButton danger onClick={() => stopBroadcast(roomId)}>
            <Phone />
          </ControlButton>
          <ControlButton onClick={() => copyRoomId()}>
            <Share2 />
          </ControlButton>
          <ControlButton onClick={() => changeVideoSource()}>
            {cameraOn ? <MonitorIcon /> : <MonitorCheckIcon />}
          </ControlButton>
        </div>
      </main>
    </div>
  );
}


function ParticipantCard({ name, muted , userId , toggleMute , changeActive }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-lg border-2 border-cyan-400 custom-box fade-in">
      <button className='flex gap-3 ' onClick={() => changeActive(name)}>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">{name[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-black dark:text-white truncate">{name}</div>
          <div className="text-xs text-slate-400">{muted ? 'Muted' : 'Active'}</div>
        </div>
      </button>
      <button className=' pr-1' onClick={() => toggleMute(userId)}>
        {muted ? <MicOff className="w-4 h-4 text-slate-400" /> : <Mic className="w-4 h-4 text-slate-400" />}
      </button>
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



