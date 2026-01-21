import { TryCatch , ResError , ResSuccess} from '../../../utils/extra.js';
import { validateLoginBody } from '../validator/auth.validator.js';
import { loginUserService } from '../services/auth.services.js';
import { generateTokens, cookieOptions } from '../../../utils/extra.js';

export const loginUser = TryCatch(async (req, res) => {
  const valid = validateLoginBody(req, res);
  if (!valid) return;

  try {
    const { user, userObj } = await loginUserService(req.body);
    const { accessToken, refreshToken } = await generateTokens(user);

    return res
      .status(200)
      .cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000,
      })
      .json({
        success: true,
        data: userObj,
      });

  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return ResError(res, 400, 'Invalid credentials');
    }
    throw err;
  }
}, 'LoginUser');


export const logoutUser = TryCatch(async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return ResSuccess(res, 200, 'Logged out successfully');
}, 'LogoutUser');
