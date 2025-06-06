import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'


function ProtectedRoute( {user}) {
    const navigate = useNavigate() ;

    useEffect(() => {
        if(!user){
            navigate('/login')
        }
    } , [user])
    
    return <Outlet/>
  
}

export default ProtectedRoute