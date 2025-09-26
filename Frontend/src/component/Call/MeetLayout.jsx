import React, { useState } from 'react';
import MeetingPage from './MeetingPage';
import { useBroadcast } from '../specific/broadcast/Broadcaster';
import { useSocket } from '../specific/socket';
import { KeyRound, LoaderCircleIcon, LockKeyhole } from "lucide-react";
import { toast } from 'react-toastify';

export default function MeetLayout() {
  const [page, setPage] = useState(true);
  const [roomId , setRoomId] = useState('ce48af5b-5a75-4c29-95bb-3b6756f14d54');
  const [loading , setLoading] = useState(false) ;

  const socket = useSocket();
  const { isLive, videoProducer, startBroadcast, audioProducer , stopBroadcast, localStreamRef} = useBroadcast(socket, roomId); 


  const joinMeeting = async (roomId , password = '') => {
    try {
      setLoading(true) ;
      socket.emit('joinMeeting' , { roomId , password } , async ({success , error}) => {
        if(success) {
          setRoomId(roomId) ;
          startBroadcast(true) ;
        };
        if(error) toast.error(error) ;
      });
    } catch (error) {
      console.error('Error joining meeting:', error);
    } finally {setLoading(false) ;}
  } ;
  const createMeeting = async (password = '') => {
    try {
      setLoading(true) ;
      socket.emit('createMeeting' , { password } , async (roomId) => {
      setRoomId(roomId);
      startBroadcast(true) ;
    });
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {setLoading(false) ;}
  } ;



  return (
    <div className="min-h-screen font-sans dark:bg-slate-900 ">
      <nav className="p-4 dark:bg-black shadow-sm  shadow-black/50 flex items-center justify-between text-black dark:text-white">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold">XConnect</div>
          <div className="text-sm text-slate-400"
            onClick={() => setPage(!page)}
          >Meetings</div>
        </div>

        <div className="flex items-center gap-2">
          {/* <button onClick={() => setPage('meeting')} className={`px-3 py-2 rounded ${page === 'meeting' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'} shadowLight`}>Meeting</button>
          <button onClick={() => setPage('call')} className={`px-3 py-2 rounded ${page === 'call' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'} shadowLight`}>Call</button> */}
        </div>
      </nav>

      {isLive ? <MeetingPage roomId={roomId} localStreamRef={localStreamRef} audioproducer={audioProducer} videoProducer={videoProducer} stopBroadcast={stopBroadcast} /> : (
        <div>
          <AddMeeting onJoin={joinMeeting} onCreate={createMeeting} loading={loading} />
        </div>
      )}
    </div>
  );
}




function AddMeeting({ onJoin, onCreate , loading }) {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");

  const [join , setJoin] = useState(false);

  const handleMeeting = () => {
    try {
      if(join){
        if(!roomId) {
          toast.error('Please enter a room ID');
        }
        onJoin(roomId, password)
      }else{
        onCreate(password)
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br dark:from-black dark:via-slate-900 dark:to-slate-800 px-10">
      <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-700 backdrop:blur-sm shadowLight">
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-center dark:text-white">
          Start or Join a Meeting
        </h2>
        <p className="text-center text-slate-400 text-sm">
          Enter a Room ID & password to join, or create a new one instantly
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={() =>setJoin(true)}
            className={`flex-1 px-5 py-3 rounded-xl font-semibold ${join ? 'text-black bg-white hover:bg-slate-200' : 'text-white bg-slate-700 hover:bg-slate-600'}  transition-all shadow-lg`}
          >
            Join Meeting
          </button>
          <button
            onClick={() => setJoin(false)}
            className={`flex-1 px-5 py-3 rounded-xl font-semibold ${!join ? 'text-black bg-white hover:bg-slate-200' : 'text-white bg-slate-700 hover:bg-slate-600'}  transition-all shadow-lg`}
          >
            Create Meeting
          </button>
        </div>

        {/* Room ID input */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-600 bg-slate-800 focus-within:ring-2 focus-within:ring-white/40 ${join ? '' : 'opacity-50'}`}>
          <KeyRound className="w-5 h-5 text-slate-400" />
          <input
            disabled={!join}
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-slate-500"
          />
        </div>

        {/* Password input */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-600 bg-slate-800 focus-within:ring-2 focus-within:ring-white/40">
          <LockKeyhole className="w-5 h-5 text-slate-400" />
          <input
            type="password"
            placeholder="Meeting Password (if required)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-slate-500"
          />
        </div>

        <button 
          onClick={() => handleMeeting(roomId, password)}
          className={`flex-1 w-full px-5 py-3 flex justify-center rounded-xl font-semibold duration-200 text-black bg-white hover:bg-slate-200 transition-all shadow-lg`}
        >
          {loading ? <LoaderCircleIcon className='animate-spin duration-200' size={17} /> : <>{join ? 'Join' : 'Create'}</> }
        </button>
        
      </div>
    </div>
  );
}
