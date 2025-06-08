import React from 'react'

function InPostImages({imagesArray}) {
  const length = imagesArray.length ;
     
  return (
      <div className={`w-full max-h-96 grid gap-2 
        ${length > 1 && ' grid-cols-2 grid-flow-col grid-rows-2'}`}>
        {length >0 && length <5 && imagesArray.map((img, index) => {
          return (
            <img
              key={index}
              src={img}
              alt={'post'+index}
              className={`w-full rounded-lg mb-2 object-cover 
                ${length == 3 && index == 2 ? ' col-span-1 row-span-2 ' : '' }  
                ${length == 2 ? 'row-span-2 h-full' : 'row-span-1 col-span-1 h-full' }
                `}
            />
        )} 
      )}
        {length >= 5 && (
          <>
          { imagesArray.slice(0 ,3).map((img ,index) => 
            <img 
              key={index}
              src={img}
              alt={'post'+index}
              className='w-full h-full rounded-lg mb-2 object-cover '
            />
          )}
          <div className='relative'>
            <div 
            className='absolute w-full h-full bg-black/50 text-white rounded-lg z10 flex justify-center items-center'
              >See more+
            </div>
            <img 
            src={imagesArray[3]}  
            className='w-full h-full rounded-lg mb-2 object-cover z-0'
            />
          </div>
          
          </>
        )} 

      </div>
  )
}

export default InPostImages