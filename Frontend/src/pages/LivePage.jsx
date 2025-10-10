import React from 'react'
import Layout from '../layout/Layout'
import StartLive from '../component/live/StartLive'
import WatchLive from '../component/live/WatchLive'

function LivePage() {
  return (
    <Layout>
      <StartLive/>
      {/* <WatchLive /> */}
    </Layout>
  )
}

export default LivePage