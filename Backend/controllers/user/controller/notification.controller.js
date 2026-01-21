import { TryCatch , ResError , ResSuccess} from "../../../utils/extra.js";

import { getMyNotificationsService } from "../services/notification.services.js";

import { markNotificationReadSchema } from "../validator_schema/user.schema.js";
import { markNotificationReadService } from "../services/notification.services.js";


export const getMyNotifications = TryCatch(async (req, res) => {
  const notifications = await getMyNotificationsService(req.user._id);

  return ResSuccess(res, 200, notifications);
}, "getMyNotifications");


export const changeMYNotificationStatus = TryCatch(async (req, res) => {
  const { body } = markNotificationReadSchema.parse({
    body: req.body,
  });

  await markNotificationReadService({
    notificationIds: body.notificationId,
    userId: req.user._id,
  });

  return ResSuccess(res, 200, "Notification status changed");
}, "changeMYNotificationStatus");
