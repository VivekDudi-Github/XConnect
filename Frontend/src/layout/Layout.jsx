import React , {useEffect} from 'react'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'
import { useSocket } from '../component/specific/socket';
import { useDispatch, useSelector } from 'react-redux';
import { addMultipleNotifications, addNotification, changeIsNotificationfetched, removeNotification } from '../redux/reducer/notificationSlice';
import {  useLazyGetMyNotificationsQuery } from '../redux/api/api';


function Layout({children}) {
const dispatch = useDispatch() ;
const {isNotificationfetched} = useSelector(state => state.notification);

  const socket = useSocket();
  useEffect(() => {
    if(socket){
      socket.on('notification:receive' , (data) => {
        console.log(data);
        dispatch(addNotification(data))
      }) ;

      socket.on('notification:retract' , (data) => {
        console.log(data);
        dispatch(removeNotification(data))
      }) ;
    }

    return () => {
      if(socket){
        socket.off('notification:receive');
        socket.off('notification:retract');
      }
    }
  } , [socket])


  
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