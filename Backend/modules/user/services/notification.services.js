import ApiError from "../../../utils/ApiError.js";
import {
  getUserNotifications,
  findNotificationById,
  markNotificationsAsRead,
} from "../db/notification.db.js";

export const getMyNotificationsService = async (userId) => {
  return getUserNotifications(userId);
};

export const markNotificationReadService = async ({notificationIds, userId}) => {
  await markNotificationsAsRead(notificationIds , userId);
};
