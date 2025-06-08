import React from 'react'

function Loader({message}) {
  return (
    <div className='h-full w-full  backdrop-filter backdrop-blur-sm text-slate-500  dark:text-white'>
      <div className='flex flex-col items-center justify-center h-full gap-2'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-gray-300'></div>
        {/* <p className='ml-4 text-lg'>{message || 'Loading...'}</p> */}
      </div>
    </div>
  )
}

export default Loader