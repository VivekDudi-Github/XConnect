import React from 'react'
import VideoPlayer from '../specific/videPlayer/VideoPlayer';

function InPostImages({imagesArray}) {
  const length = imagesArray.length ;
     
  return (
      <div className={`w-full sm:max-h-[460px] max-h-[460px] grid gap-2 mx-auto 
        ${length > 1 && ' grid-cols-2 grid-flow-col grid-rows-2'}`}>
        {length >0 && length <5 && imagesArray.map(({url , type}, index) => 
             type === 'video' ? (
                <div className='w-full h-full rounded-lg mb-2 object-cover' key={index}>
                  <VideoPlayer src={import.meta.env.VITE_SERVE_HSL_URL+url} />
                </div>
            ) : (
              <img
              key={index}
              src={url}
              alt={'post'+index}
              className={` rounded-lg mb-2 object-cover sm:max-h-[385px] max-h-48 duration-200
                ${length == 1 ? ' col-span-1 row-span-1 mx-auto h-full  ' : '' }
                ${length == 3 && index == 2 ? ' col-span-1 row-span-2 w-full h-full ' : 'row-span-1 col-span-1 h-full w-full' }  
                ${length == 2 ? 'row-span-2 h-full mx-auto' : '' }
                ${length == 4 ? 'row-span-1 col-span-1 h-full' : ''}
                `}
              />
              )
        )}
        {
        length >= 5 && (
          <>
          { imagesArray.slice(0 ,3).map(({url , type} ,index) => {
            return type === 'video' ? (
                <div className='w-full h-full rounded-lg mb-2 object-cover ' key={index}>
                  <VideoPlayer src={import.meta.env.VITE_SERVE_HSL_URL+url} />
                </div>
              ) : (
                <img 
                key={index}
                src={url}
                alt={'post'+index}
                className='w-full h-full rounded-lg mb-2 object-cover '
              />
            )} 
          )}
          <div className='relative'>
            <div 
            className='absolute w-full h-full bg-black/60 text-white rounded-lg flex justify-center items-center z-20'
              >See more+
            </div>
            {imagesArray[3].type === 'video' ? (
              <div className='w-full h-full rounded-lg mb-2 object-cover ' key={index}>
                <VideoPlayer src={import.meta.env.VITE_SERVE_HSL_URL+imagesArray[3].url} />
              </div>
            ) : (
              <img 
              src={imagesArray[3].url}  
              className='w-full h-full rounded-lg mb-2 object-cover z-0'
              />
            )}
          </div>
          </>
        )} 
      </div>
  )
}

export default InPostImages