import { Room } from "../../models/room.model.js";
import { Message } from "../../models/messages.model.js";

export const findRoomById = roomId =>
  Room.findById(roomId);

export const createMessageRepo = data =>
  Message.create(data);

export const findMessagesRepo = (filter, limit) =>
  Message.find(filter)
    .sort({ _id: -1 })
    .limit(limit)
    .populate("sender", "fullname avatar username");

export const findMessageById = id =>
  Message.findById(id);

export const saveMessageRepo = message =>
  message.save();
