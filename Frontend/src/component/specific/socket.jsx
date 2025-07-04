import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { createContext, useContext } from 'react';
import { toast } from 'react-toastify';


export const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children , user }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
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
