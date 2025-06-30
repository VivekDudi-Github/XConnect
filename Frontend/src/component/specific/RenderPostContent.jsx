import { RectangleEllipsis } from 'lucide-react';
import React , {useEffect, useState} from 'react'
import { Link } from 'react-router-dom';

function RenderPostContent({text}) {
  const regex = /(#\w+|@\w+)/g ;
  const [parts , setParts] = useState([]);

  useEffect(() => {
    if(text){
      const partsArray = text.split(regex) ;
      setParts(partsArray) ;
    }
  } , [text])

  if(parts.length > 0){
    return parts.map((part , index) => {
      if(part.startsWith('#')){
        return <Link key={index} className='text-blue-600 hover:underline font-semibold' to={'/tags/'+ part.slice(1)} >{part}</Link>
      }
      if(part.startsWith('@')){
        return <Link key={index} className='text-purple-600  dark:text-purple-400 hover:underline font-semibold' to={'/profile/'+ part.slice(1)} >{part}</Link>
      }
      return <span key={index}>{part}</span>
    })
  }
  
}

export default RenderPostContent


