import { TryCatch , ResSuccess } from "../../utils/extra.js";
import { validate } from "../../middlewares/validate.js";
import * as schema from "./room.schema.js";
import * as service from "./room.service.js";
import {Room} from "../../models/room.model.js";
import { getRoomsAggregation } from "./room.db.js";

export const createRoom = TryCatch(async (req, res) => {
  validate(schema.createRoomSchema, req);
  const room = await service.createRoomService(req.user, req.body);
  ResSuccess(res, 200, room);
});

export const updateGroup = TryCatch(async (req, res) => {
  validate(schema.updateGroupSchema, req);
  await service.updateGroupService(req.user, req.body);
  ResSuccess(res, 200, "Room updated successfully");
});

export const deleteRoom = TryCatch(async (req, res) => {
  validate(schema.roomIdParamSchema, req);
  await service.deleteRoomService(req.user, req.params.id);
  ResSuccess(res, 200, "Room deleted successfully");
});

export const getRooms = TryCatch(async (req, res) => {
  const rooms = await Room.aggregate(getRoomsAggregation(req.user._id));
  ResSuccess(res, 200, rooms);
});

export const getSingleRoom = TryCatch(async (req, res) => {
  validate(schema.roomIdParamSchema, req);
  const room = await Room.findById(req.params.id);
  if (!room) throw { status: 404, message: "Room not found" };
  ResSuccess(res, 200, room);
});
