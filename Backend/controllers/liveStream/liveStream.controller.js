import { validate } from "../../middlewares/validate.js";
import * as schema from "./liveStream.validator.js";
import * as service from "./liveStream.services.js";
import { ResSuccess, TryCatch } from "../../utils/extra.js";

export const createLiveStream = TryCatch(async (req, res) => {
  validate(schema.createLiveStreamSchema, req);

  const stream = await service.createLiveStreamService({
    user: req.user,
    ...req.body,
  });

  ResSuccess(res, 201, stream);
} , 'createLiveStream');

export const deleteLiveStream = TryCatch(async (req, res) => {
  validate(schema.liveStreamIdParamSchema, req);

  await service.deleteLiveStreamService(req.params.id, req.user);
  ResSuccess(res, 200, "Live stream deleted successfully");
} , 'deleteLiveStream');

export const updateLiveStream = TryCatch(async (req, res) => {
  validate(schema.updateLiveStreamSchema, req);

  const stream = await service.updateLiveStreamService(
    req.params.id,
    req.user,
    req.body,
    req.io
  );

  ResSuccess(res, 200, stream);
} , 'updateLiveStream');

export const getLiveStream = TryCatch(async (req, res) => {
  validate(schema.liveStreamIdParamSchema, req);

  const stream = await service.getLiveStreamService(
    req.params.id,
    req.user._id
  );

  ResSuccess(res, 200, stream);
} , 'getLiveStream');

export const getUserLiveStreams = TryCatch(async (req, res) => {
  validate(schema.getUserLiveStreamsSchema, req);

  const streams = await service.getUserLiveStreamsService(
    req.params.id,
    req.query.page,
    req.query.limit
  );

  ResSuccess(res, 200, streams);
} , 'getUserLiveStreams');

export const getLiveChats = TryCatch(async (req, res) => {
  validate(schema.getLiveChatsSchema, req);

  const chats = await service.getLiveChatsService(
    req.params.id,
    req.query.limit,
    req.query.lastId
  );

  ResSuccess(res, 200, { messages: chats });
} , 'getLiveChats');
