import { toggleFollowSchema } from "../validator_schema/user.schema.js";
import { toggleFollowService } from "../services/toggleFollow.services.js";
import { TryCatch , ResError , ResSuccess} from "../../../utils/extra.js";

export const toggleFollow = TryCatch(async (req, res) => {
  const { params } = toggleFollowSchema.parse({
    params: req.params,
  });

  const result = await toggleFollowService({
    targetUserId: params.id,
    currentUser: req.user,
  });

  return ResSuccess(res, 200, {operation : result.followed});
}, "toggleFollow");
