import { Notification } from "../../../models/notifiaction.model.js";

export const createFollowNotification = ({ sender, receiver }) => {
  return Notification.create({
    type: "follow",
    sender,
    receiver,
    isRead: false,
  });
};

export const deleteFollowNotification = ({ sender, receiver }) => {
  return Notification.findOneAndDelete({
    type: "follow",
    sender,
    receiver,
  });
};

export const getUserNotifications = (userId) => {
  return Notification.find({ receiver: userId })
    .populate("sender", "avatar fullname username");
};

export const findNotificationById = (id) => {
  return Notification.findById(id);
};

export const markNotificationsAsRead = (ids) => {
  const ops = ids.map((id) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { isRead: true } },
    },
  }));

  return Notification.bulkWrite(ops, { ordered: false });
};
