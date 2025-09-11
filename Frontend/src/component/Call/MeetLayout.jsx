import React, { useState } from 'react';
import MeetingPage from './MeetingPage';
import CallPage from './CallPage';

export default function MeetLayout() {
  const [page, setPage] = useState(true);

  return (
    <div className="min-h-screen font-sans dark:bg-slate-900">
      <nav className="p-4 dark:bg-black shadow-sm flex items-center justify-between text-black dark:text-white">
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

      {page ? <MeetingPage /> : <CallPage />}
    </div>
  );
}