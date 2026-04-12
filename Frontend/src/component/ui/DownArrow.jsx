import { ArrowDown } from 'lucide-react'
import React from 'react'

function DownArrow({rotate}) {
  return (
    <div className={`h-10 flex justify-center items-center md:rotate-0 -rotate-90`}>
      <ArrowDown size={25}  strokeWidth={2} color='white' stopColor='gray'/>
    </div>
  )
}

export default DownArrow