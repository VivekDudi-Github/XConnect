import React from 'react'

function ChatCardSekelton() {
  return (
    <div className="flex bg-white w-full mb-3 rounded-xl dark:shadow-sm p-4 dark:bg-black  dark:from-slate-900 dark:to-black dark:text-white shadow-slate-400 shadow-lg border-t dark:border-2 dark:border-white dark:border- border-slate-800/50  animate-pulse duration-200" >
      {/* Avatar */}
      <img
        src={'/avatar-default.svg'}
        className="w-12 h-12 rounded-full object-cover mr-2 duration-200"
      />

      {/* User Info */}
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex justify-between items-center h-[50%]">
          <div className='flex gap-2 items-center h-full w-full'>
            <p className=" w-[30%] h-full dark:text-white font-semibold  bg-slate-500 rounded-md "></p>
            <p className=" w-[10%] h-full bg-cyan-600 dark:bg-slate-400 rounded-md  "></p> 
          </div>
          {/* Last Online */}
          <span className=" w-[10%] h-1/2 bg-slate-700 rounded-md " ></span>
        </div>

        <div className="flex justify-between items-center w-full h-full mt-1">
          {/* Last Message */}
          <p className={`text-sm truncate max-w-[70%] h-1/2 bg-slate-700 w-1/3  rounded-md`}></p>

        </div>
      </div>
    </div>
  )
}

export default ChatCardSekelton