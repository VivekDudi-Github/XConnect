import React , {useEffect, useRef} from 'react'
import { useSocket } from './socket';
import { useDispatch, useSelector } from 'react-redux';
import { addMultipleNotifications, addNotification, changeIsNotificationfetched, removeNotification } from '../../redux/reducer/notificationSlice';
import {  useLazyGetMyNotificationsQuery } from '../../redux/api/api';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { setUnreadMessage } from '../../redux/reducer/messageSlice';
import { toast } from 'react-toastify';

function GlobalSocketListener() {
const dispatch = useDispatch() ;
const navigate = useNavigate() ;
const {isNotificationfetched} = useSelector(state => state.notification);


const socket = useSocket();
const room_idRef = useRef(null) ;

const {room_id} = useSelector(state => state.misc.chatName) ;


  
useEffect(() => {
  room_idRef.current = room_id ;
} , [room_id]) ;

  useEffect(() => {
    console.log(room_idRef.current);
    
    let notification_recieve =  (data) => {
        console.log(data);
        dispatch(addNotification(data))
    }
    let Receive_Message_Listener = (data) => {
      
      if(room_idRef?.current !== data.room ){
        dispatch(setUnreadMessage({room_id : data.room ,message : data })) 
        console.log(data);
      }
    }
    let notification_retract = (data) => {
      console.log(data);
      dispatch(removeNotification(data))
    } ;
    let rateLimitError = () => {
      toast.error('You are sending too many requests, please slow down.') ;
    }

    if(!socket) {
      console.log('socket not available');
      return ;
    };
    
    if(socket){
      console.log('listening...');
      
      socket.on('notification:receive' , notification_recieve) ;
      socket.on('RECEIVE_MESSAGE' , Receive_Message_Listener) ;
      socket.on('notification:retract' , notification_retract ) ;
      socket.on('RATE_LIMIT_EXCEEDED' , rateLimitError) ;

      return () => {
        socket.off('notification:receive', notification_recieve) ;
        socket.off('RECEIVE_MESSAGE' , Receive_Message_Listener);
        socket.off('notification:retract' , notification_retract);
        socket.off('RATE_LIMIT_EXCEEDED' , rateLimitError) ;
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
  

}

export default GlobalSocketListener