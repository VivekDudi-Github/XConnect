import { TryCatch } from '../../utils/tryCatch.js';
import { ResSuccess, ResError } from '../../utils/response.js';
import {
  inviteModeratorsService,
  checkModInviteService,
  toggleModeratorService,
} from './moderation.service.js';
import {
  inviteModsSchema,
  communityIdParamSchema,
} from './moderation.schema.js';
import { emitEvent } from '../../../utils/socket.js';
import { NOTIFICATION_RECEIVE } from '../../../utils/constants/notification.contant.js';

export const inviteMods = TryCatch(async (req, res) => {
  const parsed = inviteModsSchema.safeParse({ body: req.body });
  if (!parsed.success) return ResError(res, 400, parsed.error.errors[0].message);

  try {
    const notifs = await inviteModeratorsService({
      ...parsed.data.body,
      user: req.user,
    });

    let sender = req.user ;
    notifs.forEach(notif => {
      emitEvent(  NOTIFICATION_RECEIVE , 'user' , notif.reciver , 
        {...notif._doc , 
          sender : {
            _id : sender._id ,
            username : sender.username ,
            avatar : sender.avatar ,
          }
        } 
      )
    })

    return ResSuccess(res, 200, 'Moderators invited successfully.');
  } catch (err) {
    if (err.message === 'COMMUNITY_NOT_FOUND')
      return ResError(res, 400, 'Invalid community ID.');
    if (err.message === 'NOT_CREATOR')
      return ResError(res, 403, 'Only community creator can invite moderators.');
    throw err;
  }
}, 'inviteMods');

export const getCommunityIsInvited = TryCatch(async (req, res) => {
  const parsed = communityIdParamSchema.safeParse({ params: req.params });
  if (!parsed.success) return ResError(res, 400, parsed.error.errors[0].message);

  try {
    const isInvited = await checkModInviteService({
      userId: req.user._id,
      communityId: parsed.data.params.id,
    });

    if (!isInvited) return ResError(res, 404, 'No invite found');
    return ResSuccess(res, 200, { isInvited: true });
  } catch (err) {
    if (err.message === 'COMMUNITY_NOT_FOUND')
      return ResError(res, 400, 'Invalid community ID');
    throw err;
  }
}, 'getCommunityIsInvited');

export const toggleJoinMod = TryCatch(async (req, res) => {
  const parsed = communityIdParamSchema.safeParse({ params: req.params });
  if (!parsed.success) return ResError(res, 400, parsed.error.errors[0].message);

  try {
    const result = await toggleModeratorService({
      communityId: parsed.data.params.id,
      user: req.user,
    });

    return ResSuccess(res, 200, { operation: result.operation });
  } catch (err) {
    if (err.message === 'COMMUNITY_NOT_FOUND')
      return ResError(res, 404, 'Invalid community ID');
    if (err.message === 'NOT_INVITED')
      return ResError(res, 400, 'You are not invited as moderator');
    throw err;
  }
}, 'toggleJoinMod');
