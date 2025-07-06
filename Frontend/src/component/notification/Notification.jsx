import { useEffect, useState } from "react";
import NotificationItem from "./NotitficationItem";
import NotificationSkeleton from "../shared/NotificationSkeleton";

export const mockNotifications = [
  {
    _id: "notif1",
    type: "like",
    fromUser: {
      _id: "user1",
      username: "johndoe",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    post: {
      _id: "post123",
      content: "This is a mock post liked by johndoe"
    },
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    isRead: false
  },
  {
    _id: "notif2",
    type: "comment",
    fromUser: {
      _id: "user2",
      username: "janedoe",
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    post: {
      _id: "post456",
      content: "Check out this new post!"
    },
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    isRead: false
  },
  {
    _id: "notif3",
    type: "follow",
    fromUser: {
      _id: "user3",
      username: "devguy",
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    post: null,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    isRead: true
  },
  {
    _id: "notif4",
    type: "repost",
    fromUser: {
      _id: "user4",
      username: "coolcat",
      avatar: "https://i.pravatar.cc/150?img=4"
    },
    post: {
      _id: "post789",
      content: "React tips for beginners"
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: false
  },
  {
    _id: "notif5",
    type: "like",
    fromUser: {
      _id: "user5",
      username: "naturelover",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    post: {
      _id: "post101",
      content: "Sunset view 🌇"
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true
  }
];


export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  

  // useEffect(() => {
  //   const loadNotifications = async () => {
  //     try {
  //       // const data = await fetchNotifications();
  //       setNotifications(data);
  //     } catch (err) {
  //       console.error("Failed to load notifications:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadNotifications();
  // }, []);

  return (
    <div className="max-w-xl mx-auto p-4 dark:bg-black">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {!loading ? (
        <NotificationSkeleton count={5} />
      ) : mockNotifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3 ">
          {mockNotifications.map((notif) => (
            <NotificationItem key={notif._id} notification={notif} />
          ))}
        </ul>
      )}
    </div>
  );
}
