import { TryCatch ,ResError , ResSuccess} from '../../../utils/extra.js';
import { validateGetMe } from '../validator/getMe.vadilator.js';
import { getMeService } from '../services/getMe.services.js';

export const getMe = TryCatch(async (req, res) => {
  const valid = validateGetMe(req, res);
  if (!valid) return;

  const user = await getMeService(req.user._id);

  if (!user) {
    return ResError(res, 404, 'User not found');
  }

  return ResSuccess(res, 200, user);
}, 'GetMe');
