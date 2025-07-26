import React , {useEffect, useMemo} from 'react'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'
import { useSocket } from '../component/specific/socket';
import { useDispatch, useSelector } from 'react-redux';
import { addMultipleNotifications, addNotification, changeIsNotificationfetched, removeNotification } from '../redux/reducer/notificationSlice';
import {  useLazyGetMyNotificationsQuery } from '../redux/api/api';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { setUnreadMessage } from '../redux/reducer/messageSlice';


function Layout({children}) {
const dispatch = useDispatch() ;
const navigate = useNavigate() ;
const {isNotificationfetched} = useSelector(state => state.notification);


  const {room_id} = useSelector(state => state.misc.chatName) ;

  const socket = useSocket();
  useEffect(() => {
    let notification_recieve =  (data) => {
        console.log(data);
        dispatch(addNotification(data))
    }
    let Receive_Message_Listener = (data) => {
      if(room_id !== data.room_id ){
        dispatch(setUnreadMessage({room_id : data.room_id ,message : data })) 
        console.log(data);
      }
    }
    let notification_retract = (data) => {
      console.log(data);
      dispatch(removeNotification(data))
    } ;

    if(!socket) return;
    
    if(socket){
      socket.on('notification:receive' , notification_recieve) ;
      socket.on('RECEIVE_MESSAGE' , Receive_Message_Listener) ;
      socket.on('notification:retract' , notification_retract ) ;

      return () => {
        socket.off('notification:receive', notification_recieve) ;
        socket.off('RECEIVE_MESSAGE' , Receive_Message_Listener);
        socket.off('notification:retract' , notification_retract);
      }
    }

    return () => {
      if(socket){
        socket.off('notification:receive');
        socket.off('notification:retract');
      }
    }
  } , [socket , dispatch , room_id])


  
  const [ fetchNotifications , {isError , error , data}] = useLazyGetMyNotificationsQuery() ;
  
  useEffect(() => {
    if(isNotificationfetched === false){
      fetchNotifications();
    }
  } , [])

  useEffect(() => {
    if(data && data.data){
      console.log('fectchNotifications');
      dispatch(changeIsNotificationfetched(true))
      dispatch(addMultipleNotifications(data.data)) ;
    }
  } , [data]) ;

  useEffect(() => {
    if(isError){
      console.error("Error fetching notifications:", error);
    }
  } , [isError]) ;
  

  return (
    <>
      <div className="flex overflow-y-auto dark:bg-black bg-white">
      {/* Sidebar (hidden on small screens) */}
      <div className="fixed md:w-56 sm:w-[72px] sm:translate-x-0 w-0 -translate-x-12 bg-white dark:bg-black md:border-r-2 border-r-0 border-x-gray-400 shadow-sm left-0 top-0 duration-200 h-screen ">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className=" text-black md:ml-60 sm:ml-[76px]  h-auto overflow-y-auto w-full duration-200">
        {children}
      </main>

      {/* Bottom nav (only visible on small screens) */}
      <div className=" fixed sm:translate-y-full translate-y-0 bottom-0 left-0 w-full bg-white dark:border-gray-700 border-t shadow-md z-50 duration-200">
        <BottomBar />
      </div>
    </div>
    </>
  )
}

export default Layout