import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';


export const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children , user }) => {
  const [socket, setSocket] = useState(null);

  
  const isProduction = import.meta.env.PROD ;
  const production_url = import.meta.env.VITE_PRODUCTION_URL ;
  const development_url = import.meta.env.VITE_DEVELOPMENT_URL ;



  useEffect(() => {
    const newSocket = io(isProduction ? production_url : development_url, {
      path : isProduction ? '/serve/socket.io' : '/socket.io' ,
      autoConnect : true ,
      reconnection : true , 
      withCredentials : true 
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user?._id ]);


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
