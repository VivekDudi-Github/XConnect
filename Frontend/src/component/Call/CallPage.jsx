import React, { useState } from 'react';
import { Video, Users, MessageCircle, Phone, Mic, Video as VideoIcon, Share2, Settings, X, MicOff, PhoneCall } from 'lucide-react';


export default function CallPage() {
  const [muted, setMuted] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  const participants = ['You', 'Ravi', 'Sara'];

  return (
    <div className="h-full dark:bg-slate-900 flex flex-col text-white">
      <header className="flex items-center justify-between p-4 bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">R</div>
          <div>
            <div className="text-sm font-semibold">Ravi Kumar</div>
            <div className="text-xs text-slate-400">Calling • Mumbai</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Settings className="w-4 h-4" />
          <X className="w-4 h-4" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative">
        <div className="relative w-[78%] aspect-video rounded-3xl bg-black flex items-center justify-center">
          {/* Large remote video */}
          <div className="text-white text-center">
            <div className="text-4xl font-semibold">Ravi</div>
            <div className="text-sm text-slate-400">Video feed</div>
          </div>

          {/* Small self preview */}
          <div className="absolute right-6 bottom-6 w-36 h-24 rounded-md bg-white/10 border border-white/20 p-2 flex flex-col items-center justify-center">
            <div className="text-xs text-white/90">You</div>
            <div className="w-10 h-10 bg-slate-600 rounded-full mt-2"></div>
          </div>
        </div>

        {/* Participants sidebar */}
        {showParticipants && (
          <div className="absolute right-4 top-4 w-64 bg-slate-800 rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Participants</h3>
            <ul className="space-y-2 text-sm">
              {participants.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">{p[0]}</div>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <footer className="p-4 flex items-center justify-center gap-6 bg-slate-800">
        <button onClick={() => setMuted((m) => !m)} className="p-3 rounded-full bg-slate-700">
          {muted ? <MicOff className="w-6 h-6 text-slate-200" /> : <Mic className="w-6 h-6 text-slate-200" />}
        </button>

        <button onClick={() => setVideoOn((v) => !v)} className="p-3 rounded-full bg-slate-700">
          <VideoIcon className="w-6 h-6 text-slate-200" />
        </button>

        <button className="p-4 rounded-full bg-red-600 text-white shadow-lg">
          <PhoneCall className="w-6 h-6" />
        </button>

        <button onClick={() => setShowParticipants((s) => !s)} className="p-3 rounded-full bg-slate-700">
          <Users className="w-6 h-6 text-slate-200" />
        </button>
      </footer>
    </div>
  );
}