import LiveStream from "./livestream.model.js";
import LiveChat from "../chat/liveChat.model.js";
import Following from "../follow/following.model.js";

export const createLiveStreamRepo = data =>
  LiveStream.create(data);

export const findLiveStreamById = id =>
  LiveStream.findById(id).populate("host", "username avatar name");

export const deleteLiveStreamRepo = id =>
  LiveStream.findByIdAndDelete(id);

export const updateLiveStreamRepo = stream =>
  stream.save();

export const getUserLiveStreamsRepo = (host, skip, limit) =>
  LiveStream.find({ host })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("host", "avatar username");

export const deleteLiveChatsRepo = roomId =>
  LiveChat.deleteMany({ roomId });

export const getLiveChatsRepo = (filter, limit) =>
  LiveChat.find(filter)
    .sort({ _id: -1 })
    .limit(limit)
    .populate("sender", "name username avatar");

export const getFollowStatsRepo = async (userId, hostId) => {
  const followers = await Following.countDocuments({ followedTo: hostId });
  const isFollowing = await Following.exists({
    followedBy: userId,
    followedTo: hostId,
  });
  return { followers, isFollowing };
};
