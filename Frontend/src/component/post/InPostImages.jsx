import React from 'react'

function InPostImages({imagesArray}) {
  const length = imagesArray.length ;
     
  return (
      <div className={`w-full sm:max-h-96 max-h-48 grid gap-2 mx-auto 
        ${length > 1 && ' grid-cols-2 grid-flow-col grid-rows-2'}`}>
        {length >0 && length <5 && imagesArray.map(({url , type}, index) => 
             type === 'video' ? (
              <video controls
              key={index}
              src={url}
              alt={'post'+index}
              className='w-full h-full rounded-lg mb-2 object-cover '
              /> 
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
                <video controls
                key={index}
                src={url}
                alt={'post'+index}
                className='w-full h-full rounded-lg mb-2 object-cover '
              />
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
            className='absolute w-full h-full bg-black/50 text-white rounded-lg z10 flex justify-center items-center'
              >See more+
            </div>
            {imagesArray[3].type === 'video' ? (
              <video controls
              src={imagesArray[3].url}  
              className='w-full h-full rounded-lg mb-2 object-cover z-0'
              />
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