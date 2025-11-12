import { useEffect, useState } from "react";
import NotificationItem from "./NotitficationItem";
import NotificationSkeleton from "../shared/NotificationSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { addMultipleNotifications,  markAllAsRead } from "../../redux/reducer/notificationSlice";
import { useChangeNotificationStatusMutation } from "../../redux/api/api";


export default function Notification() {
 const dispatch = useDispatch() ;

  const { notifications , unreadCount } = useSelector(state => state.notification) ;
  const [loading, setLoading] = useState(false);

  const [changeNotificationStatus] = useChangeNotificationStatusMutation() ;
  
  useEffect(() => {
    if(unreadCount > 0){
      const ids = notifications.filter(n => n.isRead === false).map(n => n._id)
      console.log(ids);
      if(ids.length > 0){
        changeNotificationStatus({notificationId : ids})
      }
    }
  } , [notifications , unreadCount])


  useEffect(() => {
    const func = () => {
      if(notifications.length > 0){
        dispatch(markAllAsRead())
      }
    }
    return func();
  } , []);

  return (
    <div className="max-w-xl mx-auto p-4 dark:bg-black min-h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {loading ? (
        <NotificationSkeleton count={5} />
      ) : notifications.length === 0 ?  (
        <div className="flex-1 flex items-center justify-center text-gray-500 -translate-y-24 ">No notifications yet.</div>
      ) : (
        <ul className="space-y-4 ">
          {notifications.map((notif) => (
            <NotificationItem  key={notif._id} notification={notif} />
          ))}
        </ul>
      )}
    </div>
  );
}
