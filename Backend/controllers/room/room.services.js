import mongoose from "mongoose";
import {
  findOneOnOneRoom,
  createRoomRepo,
  findRoomById,
  getValidUsersByIds,
} from "./room.db.js";

export const createRoomService = async (user, payload) => {
  const { name, description, type, members } = payload;

  const validMemberIds = members.filter(
    id => mongoose.isValidObjectId(id) && id !== user._id.toString()
  );

  if (type === "one-on-one" && validMemberIds.length !== 1)
    throw { status: 400, message: "one-on-one must have exactly one member" };

  if (type === "group" && (!name || !description))
    throw { status: 400, message: "Group requires name and description" };

  if (type === "one-on-one") {
    const existing = await findOneOnOneRoom([...validMemberIds, user._id]);
    if (existing && existing.members.length === 2) return existing;
  }

  const users = await getValidUsersByIds(validMemberIds);
  const memberIds = users.map(u => u._id);

  const roomData =
    type === "group"
      ? {
          name,
          description,
          owner: user._id,
          members: [...memberIds, user._id],
          admins: [user._id],
          type,
        }
      : {
          owner: user._id,
          members: [...memberIds, user._id],
          type,
        };

  return createRoomRepo(roomData);
};

export const updateGroupService = async (user, payload) => {
  const room = await findRoomById(payload.id);
  if (!room) throw { status: 404, message: "Room not found" };
  if (!room.owner.equals(user._id))
    throw { status: 403, message: "Not room owner" };

  Object.assign(room, {
    ...(payload.name && { name: payload.name }),
    ...(payload.description && { description: payload.description }),
  });

  if (payload.removeMembers?.length) {
    room.members = room.members.filter(
      m => !payload.removeMembers.includes(m.toString())
    );
    room.admins = room.admins.filter(
      m => !payload.removeMembers.includes(m.toString())
    );
  }

  if (payload.promotions?.length) {
    const promotable = payload.promotions.filter(
      id =>
        room.members.some(m => m.equals(id)) &&
        !room.admins.some(a => a.equals(id))
    );
    room.admins.push(...promotable);
  }

  if (payload.members?.length) {
    const users = await getValidUsersByIds(payload.members);
    const newMembers = users
      .map(u => u._id)
      .filter(id => !room.members.some(m => m.equals(id)));
    room.members.push(...newMembers);
  }

  await room.save();
};

export const deleteRoomService = async (user, roomId) => {
  const room = await findRoomById(roomId);
  if (!room) throw { status: 404, message: "Room not found" };
  if (!room.owner.equals(user._id))
    throw { status: 403, message: "Not room owner" };

  room.isDeleted = true;
  await room.save();
};
