import {
  getUserNotifications,
  findNotificationById,
  markNotificationsAsRead,
} from "../db/notification.db.js";

export const getMyNotificationsService = async (userId) => {
  return getUserNotifications(userId);
};

export const markNotificationReadService = async ({notificationIds, userId}) => {

  const notification = await findNotificationById(notificationIds[0]);
  if (!notification) {
    throw new Error("Notification not found");
  }

  if (!notification.receiver.equals(userId)) {
    throw new Error("Unauthorized");
  }

  await markNotificationsAsRead(notificationIds);
};
