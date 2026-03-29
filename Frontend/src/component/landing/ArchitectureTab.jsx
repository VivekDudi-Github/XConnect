import { ChevronRightIcon, CogIcon, DatabaseZapIcon, icons, MonitorSmartphoneIcon, NetworkIcon, ServerCogIcon, SquareSplitVerticalIcon } from 'lucide-react'
import React, { useState } from 'react'
import DownArrow from '../ui/DownArrow';

function ArchitectureTab() {
  const [selectedFlow , setSelectedFlow] = useState('') ;
  
  function selectFlow(flow){
    if(selectedFlow === flow) return setSelectedFlow('') ;
    setSelectedFlow(flow) ;
  }
  return (
    <div className='w-full h-full mx-10 border p-8 z-10 fade-in backdrop-filter backdrop-blur-sm rounded-lg bg-black/80 text-white mt-16 '> 
      Architecture
      <div onClick={() => selectFlow('Request Flow')} className=' cursor-pointer'>
        <RequestFlow isSelected={selectedFlow === 'Request Flow'}/>
      </div>
      <div onClick={() => selectFlow('Authentication Flow')} className=' cursor-pointer'>
        <RequestFlow isSelected={selectedFlow === 'Authentication Flow'}/>
      </div>
    </div>
  )
}

export default ArchitectureTab


function RequestFlow({isSelected}){
  return (
    <div className={`flex flex-col text-white transistion-all`}>         
      <h1 className='font-bold text-3xl  items-center gap-2 relative '>
        <ChevronRightIcon size={25} strokeWidth={4} className={`${isSelected ? ' rotate-90' : ''} absolute -left-6 top-2 duration-200`}/>
        Request Flow <br/>
        <p className='text-sm font-semibold'>How an api travels through the system and returns a response</p>
      </h1>
      
      <div className={`grid transition-all duration-300 ease-linear ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}> 
        <div className='flex flex-row gap-2 overflow-hidden'>
          {/* Flow Diagram */}
          <div className='h-full flex flex-col  '>
            <FlowBox bgcolor={'bg-purple-800'} mainText={'Client Request'} secText={'React Frontend'} Icon={MonitorSmartphoneIcon} /><DownArrow/>
            <FlowBox bgcolor={'bg-cyan-600'} mainText={'API Request'} secText={'Redux Query'} Icon={NetworkIcon} /><DownArrow/>
            <FlowBox bgcolor={'bg-yellow-600'} mainText={'Backend Server'} secText={'Express via router'} Icon={ServerCogIcon} /><DownArrow/>
            <FlowBox bgcolor={'bg-red-600'} mainText={'Controller'} secText={'Uses Zod for validation'} Icon={CogIcon} /><DownArrow/>
            <FlowBox bgcolor={'bg-green-600'} mainText={'Service Layer'} secText={''} Icon={SquareSplitVerticalIcon} /><DownArrow/>
            <FlowBox bgcolor={'bg-blue-600'} mainText={'DB Layer'} secText={'MongoDB'} Icon={DatabaseZapIcon} /> 
          </div>

          <div className=' h-full p-2 '>
            <ol className='list-disc text-md ml-2'>
              <li className='text-md font-semibold'>User performs an action on frontend which triggers an api request.</li>
              <li className='text-md font-semibold'>Express server recieves the api request , do the checks and then route it to the appropraite controller.</li>
              <li className='text-md font-semibold'>Controller processes the request and send it to validator and then to service layer for business logic.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowBox({mainText , bgcolor , secText , Icon}){
  return (
    <div className='max-w-1/2 h-full rounded-md p-1'>
      <div className={`flex justify-center gap-2 ${bgcolor} rounded-md h-16 w-48 `}>
        <Icon size={28} className='h-full' />
        <div className=' text-center my-auto '>
          <h1 className='text-md font-semibold '>
            {mainText}
          </h1>
          <p className='text-sm'> {secText}</p>
        </div>
      </div>
    </div>
  )
}