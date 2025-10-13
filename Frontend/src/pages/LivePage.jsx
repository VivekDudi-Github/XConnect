import React from 'react'
import Layout from '../layout/Layout'
import StartLive from '../component/live/StartLive'
import WatchLive from '../component/live/WatchLive'
import { useParams } from 'react-router-dom';

function LivePage() {
  const {id} = useParams() ;
  console.log(id);
  
  return (
    <Layout>
      <div className=' '>
        { !id ? <StartLive/> : <WatchLive />}
      </div>
      {/* <WatchLive /> */}
    </Layout>
  )
}

export default LivePage