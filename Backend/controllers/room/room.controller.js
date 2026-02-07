import { TryCatch , ResSuccess } from "../../utils/extra.js";
import { validate } from "../../middlewares/validate.js";
import * as schema from "./room.validator.js";
import * as service from "./room.services.js";
import {Room} from "../../models/room.model.js";
import { getRoomsAggregation } from "./room.db.js";

export const createRoom = TryCatch(async (req, res) => {
  validate(schema.createRoomSchema, req);
  const room = await service.createRoomService(req.user, req.body);
  ResSuccess(res, 200, room);
} , 'createRoom');

export const updateGroup = TryCatch(async (req, res) => {
  validate(schema.updateGroupSchema, req);
  await service.updateGroupService(req.user, req.body);
  ResSuccess(res, 200, "Room updated successfully");
} , 'updateGroup');

export const deleteRoom = TryCatch(async (req, res) => {
  validate(schema.roomIdParamSchema, req);
  await service.deleteRoomService(req.user, req.params.id);
  ResSuccess(res, 200, "Room deleted successfully");
} , 'deleteRoom');

export const getRooms = TryCatch(async (req, res) => {
  const rooms = await Room.aggregate(getRoomsAggregation(req.user._id));
  ResSuccess(res, 200, rooms);
}, 'getRooms');

export const getSingleRoom = TryCatch(async (req, res) => {
  validate(schema.roomIdParamSchema, req);
  const room = await Room.findById(req.params.id);
  if (!room) throw { statusCode: 404, message: "Room not found" };
  ResSuccess(res, 200, room);
} , 'getSingleRoom');
