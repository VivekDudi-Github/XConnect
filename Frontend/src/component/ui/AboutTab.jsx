import React from 'react' ;
import {CheckIcon} from 'lucide-react' ;

const featureList = [
  "User signup and login with JWT-based authentication and authorization",
  "Post creation, likes, comments, replies, bookmarks, media attachments",
  "Community creation, joining, leaving, posting",
  "Follow and notifications system",
  "Live video streaming with mediasoup",
  "Private and group video calls using WebRtc",
  "Real-time chat with WebSockets",
  "Fully responsive and mobile-friendly along with light mode",
  "superchats payments with stripe",
]

function AboutTab() {
  return (
    <div className='w-full h-full border p-4 z-10 fade-in backdrop-filter backdrop-blur-sm rounded-lg bg-black/90 text-white - '> 
      <h1 className='text-left text-white text-3xl font-semibold'>About XConnect</h1>
      <p className='text-left text-white'>
        XConnect is designed to demonstrate a scalable real-time social platform with live streaming, WebRTC communication, communities , posts and production-ready backend architecture. 
      </p>
      <div className='mt-6 text-left text-white flex sm:flex-row flex-col gap-2'>
        <div>
          <h3 className='text-2xl text-left mb-1'>Features</h3>
          <ol className='list-inside ml- text-left text-white'>
            {featureList.map( i => 
              <li key={i} className="flex items-start gap-2">
                <CheckIcon strokeWidth={4} size={18} className="mt-1 shrink-0 " />
                <span>{i}</span>
              </li>
            )}
          </ol>
        </div>
        <div className='w-1/2'>
          <h3 className='text-2xl text-left mb-1'>Tech Stack</h3>
          <div className='flex gap-2 items-start '>
            <div className='flex items-center gap-2'>
              <img src="https://icon.icepanel.io/Technology/svg/React.svg" alt="" />
              React ●
            </div>
            <div className='flex items-center gap-2'>
              <img src="https://icon.icepanel.io/Technology/svg/Vite.js.svg" alt="" />
              Vite ●
            </div>
          </div>
          node js-https://icon.icepanel.io/Technology/svg/Node.js.svg
          express - https://icon.icepanel.io/Technology/png-shadow-512/Express.png
          socket io - https://icon.icepanel.io/Technology/png-shadow-512/Socket.io.png
          mongodb - https://icon.icepanel.io/Technology/svg/MongoDB.svg
          redux- https://icon.icepanel.io/Technology/svg/Redux.svg
          mediasoup- https://global.discourse-cdn.com/free1/uploads/mediasoup/original/2X/d/d23e0569df6cb9785ade9cea7d1bc48bfd7ced26.png
          jest - https://icon.icepanel.io/Technology/svg/Jest.svg
          <div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutTab