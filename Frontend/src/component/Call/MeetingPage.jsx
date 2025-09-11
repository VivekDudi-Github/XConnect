import React, { useState } from 'react';
import { Video, Users, MessageCircle, Phone, Mic, Video as VideoIcon, Share2, Settings, X, MicOff, PhoneCall } from 'lucide-react';

// MeetingAndCallUI.jsx with Dark Theme and Multi-view Meeting support


export default function MeetingPage() {
  const [participants] = useState([
    { name: 'You', muted: false },
    { name: 'Asha', muted: true },
    { name: 'Ravi', muted: false },
    { name: 'Sara', muted: false },
    { name: 'Team Bot', muted: true },
  ]);
  const [view, setView] = useState('grid'); // grid | spotlight

  return (
    <div className="min-h-screen grid grid-cols-12 gap-4 p-6  dark:bg-gradient-to-t to-slate-900 from-gray-900 text-white"> 
      {/* Left sidebar */}
      <aside className="col-span-3 sm:block hidden backdrop-blur-sm filter dark:bg-slate-800 rounded-2xl p-4 shadow-sm flex-col gap-4"> 
        

        {/* Right chat / notes */}
        <aside className="col-span-3 bg-slate-800 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chat & Notes</h3>
            <MessageCircle className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex-1 mt-3 overflow-auto space-y-3">
            <div className="text-xs text-slate-500">09:10 • Neon</div>
            <div className="bg-slate-700 p-3 rounded-lg text-sm">Please check the slide deck I shared.</div>
            <div className="text-xs text-slate-500">09:12 • You</div>
            <div className="bg-indigo-600/30 p-3 rounded-lg text-sm">On it — switching to screen share.</div>
          </div>

          <div className="mt-3 flex gap-2">
            <input className="flex-1 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 py-2" placeholder="Send a message..." />
            <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Send</button>
          </div>
        </aside>
        
        <div className='p-4 flex flex-col gap-4 '>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white text-black">Participants</h3>
            <div className="text-sm text-slate-400">{participants.length}</div>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {participants.map((p, i) => (
              <ParticipantCard key={i} name={p.name} muted={p.muted} />
            ))}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-300">Invite</button>
            <button className="py-2 px-3 rounded-lg bg-indigo-600 text-white">Settings</button>
          </div>
        </div>
      </aside>

      {/* Main video area */}
      <main className="sm:col-span-9 col-span-12  flex flex-col gap-4"> 
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Meeting Room</h2>
          <div className="flex gap-2">
            <button onClick={() => setView('grid')} className={`px-3 py-1  rounded ${view==='grid' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Grid</button>
            <button onClick={() => setView('spotlight')} className={`px-3 py-1 rounded ${view==='spotlight' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Spotlight</button>
          </div>
        </div>

        {view === 'spotlight' ? (
          <div className="rounded-2xl bg-black aspect-video flex items-center justify-center text-white relative overflow-hidden">
            <div className="absolute left-4 top-4 p-2 bg-black/60 rounded-md text-sm">Live • Spotlight View</div>
            <div className="text-center">
              <Video className="mx-auto w-16 h-16 opacity-80" />
              <div className="mt-2 text-lg font-semibold">Presenter: Ravi</div>
              <div className="text-sm text-slate-400 mt-1">Screen sharing — 720p</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {participants.map((p, i) => (
              <div key={i} className="rounded-lg bg-slate-800 aspect-video flex items-center justify-center border border-slate-700">
                <div className="text-center">
                  <div className="w-14 h-14 bg-slate-600 rounded-full mb-2 flex items-center justify-center text-white font-bold">{p.name[0]}</div>
                  <div className="text-sm font-medium">{p.name}</div>
                </div>
              </div>
            ))}
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


function ParticipantCard({ name, muted }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border-2 border-cyan-400 custom-box ">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">{name[0]}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-black dark:text-white truncate">{name}</div>
        <div className="text-xs text-slate-400">{muted ? 'Muted' : 'Active'}</div>
      </div>
      {muted ? <MicOff className="w-4 h-4 text-slate-400" /> : <Mic className="w-4 h-4 text-slate-400" />}
    </div>
  );
}

function ControlButton({ children, label, danger }) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition ${danger ? 'bg-red-600 text-white' : 'bg-cyan-400 hover:bg-cyan-500 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200'} `} 
    >
      {children}
      <span className={`text-[11px] ${danger ? 'text-white' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}



