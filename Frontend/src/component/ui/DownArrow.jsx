import { ArrowDown } from 'lucide-react'
import React from 'react'

function DownArrow() {
  return (
    <div className='w-full h-10 flex justify-center items-center'>
      <ArrowDown size={25}  strokeWidth={2} color='white' stopColor='gray'/>
    </div>
  )
}

export default DownArrow