import mongoose from "mongoose";
import {
  findRoomById,
  createMessageRepo,
  findMessagesRepo,
  findMessageById,
  saveMessageRepo,
} from "./message.db.js";
import {
  uploadFilesTOCloudinary,
  deleteFilesFromCloudinary,
} from "../../utils/cloudinary.js";

export const createMessageService = async ({
  user,
  room,
  message,
  media,
}) => {
  const isRoom = await findRoomById(room);
  if (!isRoom) throw { statusCode: 404, message: "Room not found" };

  let attachments = [];

  if (media?.length > 0) {
    attachments = await uploadFilesTOCloudinary(media);
  }

  return createMessageRepo({
    sender: user._id,
    room,
    message,
    attachments,
  });
};

export const getMessagesService = async ({ room, lastId, limit }) => {
  const isRoom = await findRoomById(room);
  if (!isRoom) throw { statusCode: 404, message: "Room not found" };

  const filter = {
    room,
    isDeleted: false,
  };

  if (mongoose.Types.ObjectId.isValid(lastId)) {
    filter._id = { $lt: lastId };
  }

  const messages = await findMessagesRepo(filter, limit);
  return messages.reverse();
};

export const deleteMessageService = async (id, userId) => {
  const message = await findMessageById(id);
  if (!message) throw { statusCode: 404, message: "Message not found" };

  if (!message.sender.equals(userId)) {
    throw { statusCode: 403, message: "Not message owner" };
  }

  if (message.attachments?.length > 0) {
    await deleteFilesFromCloudinary(message.attachments);
  }

  message.isDeleted = true;
  message.message = "This message was deleted by sender";

  return saveMessageRepo(message);
};
