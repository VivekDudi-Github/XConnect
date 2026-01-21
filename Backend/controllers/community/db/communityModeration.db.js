import { Community } from '../../../models/community.model.js';
import { Notification } from '../../../models/notifiaction.model.js';


export const findCommunityById = (id, select = '') =>
  Community.findById(id).select(select);

export const insertModInvites = (notifications) =>
  Notification.insertMany(notifications);

export const findModInvite = ({ sender, receiver, communityId }) =>
  Notification.findOne({
    sender,
    receiver,
    type: 'modInvite',
    'community._id': communityId,
  });

export const createNotification = (payload) =>
  Notification.create(payload);

export const deleteNotification = (id) =>
  Notification.findByIdAndDelete(id);
