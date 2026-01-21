import { TryCatch , ResSuccess, ResError } from '../../../utils/extra.js';
import { validateChangePassword } from '../validator/changePass.validator.js';
import {  changePasswordService } from '../services/changePass.services.js';

export const changePassword = TryCatch(async (req, res) => {
  const valid = validateChangePassword(req, res);
  if (!valid) return;

  try {
    await changePasswordService({
      userId: req.user._id,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    });

    return ResSuccess(res, 200, 'Password changed successfully');
  } catch (err) {
    if (err.message === 'INVALID_PASSWORD')
      return ResError(res, 400, 'Old password is incorrect');

    if (err.message === 'USER_NOT_FOUND')
      return ResError(res, 404, 'User not found');

    throw err;
  }
}, 'ChangePassword');
