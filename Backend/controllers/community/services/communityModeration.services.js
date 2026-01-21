import {
  findCommunityById,
  insertModInvites,
  findModInvite,
  createNotification,
  deleteNotification,
} from '../db/communityModeration.db.js';

export const inviteModeratorsService = async ({
  communityId,
  mods,
  user,
}) => {
  const community = await findCommunityById(communityId);
  if (!community) throw new Error('COMMUNITY_NOT_FOUND');

  if (!community.creator.equals(user._id)) {
    throw new Error('NOT_CREATOR');
  }

  const notifications = mods
    .filter(modId => !community.admins.includes(modId))
    .map(modId => ({
      receiver: modId,
      sender: user._id,
      type: 'modInvite',
      community: {
        _id: community._id,
        name: community.name,
      },
      createdAt: new Date(),
    }));

  if (!notifications.length) return [];

  return insertModInvites(notifications);
};

export const checkModInviteService = async ({ userId, communityId }) => {
  const community = await findCommunityById(communityId, 'creator');
  if (!community) throw new Error('COMMUNITY_NOT_FOUND');

  const invite = await findModInvite({
    sender: community.creator,
    receiver: userId,
    communityId: community._id,
  });

  return Boolean(invite);
};

export const toggleModeratorService = async ({ communityId, user }) => {
  const community = await findCommunityById(communityId, 'admins creator name');
  if (!community) throw new Error('COMMUNITY_NOT_FOUND');

  // Leave mod role
  if (community.admins.includes(user._id)) {
    community.admins.pull(user._id);
    await community.save();

    const notif = await createNotification({
      sender: user._id,
      receiver: community.creator,
      type: 'modLeft',
      community: { _id: community._id, name: community.name },
    });

    return { operation: false, notification: notif };
  }

  // Join mod role
  const invite = await findModInvite({
    sender: community.creator,
    receiver: user._id,
    communityId: community._id,
  });

  if (!invite) throw new Error('NOT_INVITED');

  community.admins.push(user._id);
  await community.save();
  await deleteNotification(invite._id);

  return { operation: true };
};
