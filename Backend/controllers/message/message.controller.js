import {TryCatch , ResSuccess} from "../../utils/extra.js";
import { validate } from "../../middlewares/validate.js";
import * as schema from "./message.validator.js";
import * as service from "./message.services.js";

export const createMessage = TryCatch(async (req, res) => {
  validate(schema.createMessageSchema, req);

  req.CreateMediaForDelete = [];
  const media = req.files?.media || [];

  media.forEach(file => req.CreateMediaForDelete.push(file));

  const message = await service.createMessageService({
    user: req.user,
    room: req.body.room,
    message: req.body.message,
    media,
  });

  ResSuccess(res, 200, message);
});

export const getMessages = TryCatch(async (req, res) => {
  validate(schema.getMessagesSchema, req);

  const messages = await service.getMessagesService({
    room: req.query.room,
    lastId: req.query._id,
    limit: req.query.limit,
  });

  ResSuccess(res, 200, messages);
});

export const deleteMessage = TryCatch(async (req, res) => {
  validate(schema.deleteMessageSchema, req);

  await service.deleteMessageService(req.params.id, req.user._id);
  ResSuccess(res, 200, "Message deleted successfully");
});
