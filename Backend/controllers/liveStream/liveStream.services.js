import mongoose from "mongoose";
import {
  createLiveStreamRepo,
  findLiveStreamById,
  deleteLiveStreamRepo,
  updateLiveStreamRepo,
  getUserLiveStreamsRepo,
  deleteLiveChatsRepo,
  getLiveChatsRepo,
  getFollowStatsRepo,
} from "./liveStream.db.js";

export const createLiveStreamService = async ({
  user,
  title,
  description,
  videoProducerId,
  audioProducerId,
}) => {
  return createLiveStreamRepo({
    title,
    description,
    host: user._id,
    hostName: user.username,
    startedAt: Date.now(),
    endedAt: Date.now(),
    producers: {
      videoId: videoProducerId,
      audioId: audioProducerId,
    },
    isLive: false,
  });
};

export const deleteLiveStreamService = async (id, user) => {
  const stream = await findLiveStreamById(id);
  if (!stream) throw { status: 404, message: "Live stream not found" };
  if (!stream.host.equals(user._id))
    throw { status: 403, message: "Not stream host" };

  await deleteLiveChatsRepo(id);
  await deleteLiveStreamRepo(id);
};

export const updateLiveStreamService = async (id, user, updates, io) => {
  const stream = await findLiveStreamById(id);
  if (!stream) throw { status: 404, message: "Live stream not found" };
  if (!stream.host.equals(user._id))
    throw { status: 403, message: "Not stream host" };

  Object.assign(stream, updates);
  io.to(`liveStream:${stream._id}`).emit("RECEIVE_LIVE_STREAM_DATA", stream);

  return updateLiveStreamRepo(stream);
};

export const getLiveStreamService = async (id, userId) => {
  const stream = await findLiveStreamById(id);
  if (!stream) throw { status: 404, message: "Live stream not found" };

  const followStats = await getFollowStatsRepo(userId, stream.host);
  return { ...stream.toObject(), ...followStats };
};

export const getUserLiveStreamsService = async (host, page, limit) => {
  const skip = (page - 1) * limit;
  return getUserLiveStreamsRepo(host, skip, limit);
};

export const getLiveChatsService = async (id, limit, lastId) => {
  const filter = { roomId: id };
  if (mongoose.Types.ObjectId.isValid(lastId)) {
    filter._id = { $lt: lastId };
  }

  const chats = await getLiveChatsRepo(filter, limit);
  return chats.reverse();
};
