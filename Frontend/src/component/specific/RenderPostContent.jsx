import { RectangleEllipsis } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';

export default function RenderPostContent(text) {
  const regex = /(#\w+|@\w+)/g ;
  const parts = text.split(regex) 
  console.log(parts);
  
  if(parts.length > 0){
    return parts.map((part , index) => {
      if(part.startsWith('#')){
        return <Link key={index} className='text-blue-600 hover:underline' to={'/tags/'+ part.slice(1)} >{part}</Link>
      }
      if(part.startsWith('@')){
        return <Link key={index} className='text-purple-600  dark:text-purple-400 hover:underline' to={'/profile/'+ part.slice(1)} >{part}</Link>
      }
      return <span key={index}>{part}</span>
    })
  }
}
