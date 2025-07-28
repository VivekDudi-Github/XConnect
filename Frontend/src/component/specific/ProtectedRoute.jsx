import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {io} from 'socket.io-client'
import { SocketProvider } from './socket'
import GlobalSocketListener from './GlobalSocketListener';

function ProtectedRoute( {user}) {
    const navigate = useNavigate() ;

    useEffect(() => {
        if(!user){
            navigate('/login')
        }
    } , [user])
    
    return (
        <SocketProvider user={user} >
            <GlobalSocketListener/>
            <Outlet />
        </SocketProvider>
    )
  
}

export default ProtectedRoute