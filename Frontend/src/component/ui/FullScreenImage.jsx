import { XIcon } from 'lucide-react'
import React from 'react'

function FullScreenImage({onClose , url}) {
  return (
    <div className='fixed top-0 left-0 w-screen h-screen bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 cursor-pointer fade-in' >
      <button className='absolute top-6 right-6 text-white' onClick={() => onClose()}>
        <XIcon size={24} />
      </button>
      <img src={url} alt="Full Screen" className='max-h-[90vh] max-w-[90vw] object-contain rounded-lg' />
    </div>
  )
}

export default FullScreenImage