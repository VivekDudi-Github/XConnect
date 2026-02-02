import {ResError , ResSuccess , TryCatch } from '../../../utils/extra.js';
import { validateUpdateUser } from '../validator/updateUser.validator.js';
import { updateUserService } from '../services/updateUser.services.js';
import { cookieOptions } from '../../../utils/extra.js';


export const updateUser = TryCatch(async (req, res) => {
  const valid = validateUpdateUser(req, res);
  if (!valid) return;
  
  try {
    const { user, avatarUpdated } = await updateUserService({
      userId: req.user._id,
      body: req.body,
      files: req.files,
    });

    if (avatarUpdated) {
      const accessToken = user.generateAccessToken();
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000,
      });
    }

    return ResSuccess(res, 200, user);
  } catch (err) {
    if (err.message === 'USERNAME_TAKEN') {
      return ResError(res, 400, 'Username already used');
    }

    if (err.message === 'USER_NOT_FOUND') {
      return ResError(res, 404, 'User not found');
    }

    throw err;
  }
}, 'UpdateUser');
