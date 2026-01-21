import { TryCatch ,ResError , ResSuccess} from '../../../utils/extra.js';
import { validateGetAnotherUser } from '../validator/getAnotherUser.validator.js';
import { getAnotherUserService } from '../services/getAnotherUser.services.js';


export const getAnotherUser = TryCatch(async (req, res) => {
  const valid = validateGetAnotherUser(req, res);
  if (!valid) return;

  try {
    const user = await getAnotherUserService({
      username: req.params.username,
      viewerId: req.user._id,
    });

    return ResSuccess(res, 200, user);
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') {
      return ResError(res, 404, 'User not found');
    }

    throw err;
  }
}, 'GetAnotherUser');
