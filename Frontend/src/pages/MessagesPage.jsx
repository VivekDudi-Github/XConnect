import React from 'react'
import Layout from '../layout/Layout'
import MessageHome from '../component/message/MessageHome'
import { useParams } from 'react-router-dom';
import MessagingPage from '../component/message/MessagingPage';

function MessagesPage() {
  const {username} = useParams();
  return (
    <Layout>
      <div className='dark:bg-black bg-transparent  w-full min-h-screen overflow-hidden relative'>
       {username ? <MessagingPage username={username} /> : <MessageHome/>}
      </div>
    </Layout>
  )
}

export default MessagesPage