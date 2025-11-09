import React from 'react'
import SearchBar from '../specific/search/SearchBar'
import { XIcon } from 'lucide-react';

function InviteMods({isDialog = true , onClose}) {

  const close = () => {
    onClose() ;
  }
  
  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center duration-200 transition-opacity  ${isDialog ? 'opacity-100' : 'opacity-0 hidden'}`}> 
      <div className="dark:bg-black bg-white z-50 text-white rounded-xl p-6 max-w-lg w-full text-center custom-box dark:shadow dark:border-none  shadow-slate-500/10 shadow-lg border-t"> 
        <div className=' flex justify-between'>
          <span>Invite Moderators</span>
          <button onClick={close} className='p-2 text-gray-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black transition-colors duration-300 active:scale-95'>
            <XIcon size={17}/>
          </button>
        </div>
        
        <div className='py-1 flex'><SearchBar /></div>

        <div className='text-gray-600 text-sm text-left'>List</div>
      </div>
    </div>
    
  )
}

export default InviteMods