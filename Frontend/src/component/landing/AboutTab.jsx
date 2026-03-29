import React from 'react' ;
import {CheckIcon, MailIcon} from 'lucide-react' ;

const featureList = [
  "User signup and login with JWT-based authentication and authorization",
  "Post creation, likes, comments, replies, bookmarks & media attachments",
  "Video processing with ffmpeg and hsl delivery with CDN",
  "Follow and notifications system",
  "Live video streaming with mediasoup",
  "Private and group video calls using WebRtc",
  "Real-time chat with WebSockets",
  "Fully responsive and mobile-friendly with light-dark mode",
  "superchats payments with stripe",
]

function AboutTab() {
  return (
    <div className='w-full h-full mx-10 border p-8 z-10 fade-in backdrop-filter backdrop-blur-sm rounded-lg bg-black/80 text-white mt-16 '> 
      <h1 className='text-left text-white text-3xl font-semibold mb-2'>About XConnect</h1>
      <p className='text-left text-white'>
        XConnect is designed to demonstrate a scalable real-time social platform with live streaming, WebRTC communication, communities , posts and production-ready backend architecture. 
      </p>
      <div className='mt-6 text-left text-white flex sm:flex-row flex-col gap-2 '>
        <div className='sm:w-1/2 w-full mr-2'>
          <h3 className='text-2xl text-left mb-1'>Features</h3>
          <ol className='list-inside text-left text-white'>
            {featureList.map( i => 
              <li key={i} className="flex items-start gap-2 mb-2">
                <CheckIcon strokeWidth={4} size={18} className="mt-1 shrink-0 " />
                <span>{i}</span>
              </li>
            )}
          </ol>
        </div>
        <div className='sm:w-1/2 w-full border-l-2 border-gray-800 px-4'>
          <h3 className='text-2xl text-left mb-1'>Tech Stack</h3>
          <div className='flex gap-4 items-start flex-wrap '>
            <div className='flex items-center gap-2 text-blue-400 text-lg font-bold'>
              <img className='size-16' src="https://icon.icepanel.io/Technology/svg/React.svg" alt="" />
              React ●
            </div>
            <div className='flex items-center gap-2 text-white font-bold text-lg'>
              <img className='size-16 invert' src="https://icon.icepanel.io/Technology/png-shadow-512/Express.png" alt="" />
              Express ●
            </div>
            <div className='flex items-center gap-2 text-lime-400 font-bold text-lg'>
              <img className='size-16' src="https://icon.icepanel.io/Technology/svg/Node.js.svg" alt="" />
              Node js ●
            </div>
            <div className='flex items-center gap-2 text-white font-bold text-lg'>
              <img className='size-16 invert' src="https://icon.icepanel.io/Technology/png-shadow-512/Socket.io.png" alt="" />
              Socket io ●
            </div>
            <div className='flex items-center gap-2 text-white font-bold text-lg'>
              <img className='h-16 w-20 scale-110' src="https://cdn-icons-png.flaticon.com/128/5968/5968382.png" alt="" />
              ●
            </div>
            <div className='flex items-center gap-2 text-white font-bold text-lg'>
              <img className='size-16' src="https://icon.icepanel.io/Technology/svg/MongoDB.svg" alt="" />
              MongoDB ●
            </div>

            <div className='flex items-center ml-2 gap-2 text-white font-bold text-lg'>
              <img className='h-12  ' src="https://global.discourse-cdn.com/free1/uploads/mediasoup/original/2X/d/d23e0569df6cb9785ade9cea7d1bc48bfd7ced26.png" alt="" />
              {/* MediaSoup ● */} ● 
            </div>
            {/* <div className='flex items-center gap-2 text-white font-bold text-lg'>
              <img className='size-16' src="https://icon.icepanel.io/Technology/svg/Jest.svg" alt="" />
              Jest ●
            </div> */}
          </div>
          <ol className='text-gray-300 text-wrap list-disc pl-4'>
            <li>Media storage: Cloudinary + Supabase</li>
            <li>Testing architecture: Supertest + Jest</li>
            <li>Deployment delivered via Render & Vercel</li> 
          </ol>
        </div>
      </div>

      <div className=' flex border-t-2 border-t-gray-800 p-2 mt-2'>
        <div className='w-1/2'>
          <div className=''>
            <h3 className='text-2xl text-left mb-1'>Links</h3>
          </div>
          <div className='flex gap-4 items-center mb-1'>
            <img className='size-9 invert' src="https://icon.icepanel.io/Technology/png-shadow-512/GitHub.png" alt="" />
              <a className='font-bold truncate' href="https://github.com/VivekDudi-Github/XConnect">GitHub Repository</a>
          </div>
          <div className='flex gap-4 items-center'>
            <img className='size-9 invert' src="https://cdn-icons-png.flaticon.com/128/542/542689.png" alt="" />  
            <a className='truncate ' href="mailto:vivekdudi18@gmail.com" target='_blank'>Email: vivekdudi18@gmail.com</a>
          </div>
        </div>
        <div className='w-1/2 border-l-2 border-l-gray-800 pl-4 '>
          <div className=''>
            <h3 className='text-2xl text-left mb-1'>Developed by Vivek Dudi</h3>
          </div>
          <div className='flex gap-4 items-center mb-1'>
            <img className='size-9 invert' src="https://icon.icepanel.io/Technology/png-shadow-512/GitHub.png" alt="" />
              <a href="https://github.com/VivekDudi-Github">github.com/VivekDudi-Github</a>
          </div>
          <div className='flex gap-4 items-center'>
            <img className='size-9' src="https://icon.icepanel.io/Technology/svg/LinkedIn.svg" alt="" />
              <a href="https://github.com/VivekDudi-Github/XConnect">LinkedIn : /VivekDudi</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutTab