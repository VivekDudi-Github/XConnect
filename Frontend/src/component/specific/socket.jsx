import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';


export const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children , user }) => {
  const [socket, setSocket] = useState(null);

  
  const isProduction = import.meta.env.PROD ;
  const proudction_url = import.meta.env.VITE_PRODUCTION_URL ;
  const development_url = import.meta.env.VITE_DEVELOPMENT_URL ;


  useEffect(() => {
    const newSocket = io(isProduction ? proudction_url : development_url, {
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
