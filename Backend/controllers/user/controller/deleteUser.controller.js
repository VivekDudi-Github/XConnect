import { TryCatch , ResSuccess, ResError } from '../../../utils/extra.js';
import { validateDeleteUser } from '../validator/deleteUser.validator.js';
import {  deleteUserService } from '../services/deleteUser.services.js';


export const deleteUser = TryCatch(async (req, res) => {
  const valid = validateDeleteUser(req, res);
  if (valid !== true) return;

  try {
    await deleteUserService({
      userId: req.user._id,
      password: req.body.password,
    });

    return ResSuccess(res, 200, 'Account removed successfully');
  } catch (err) {
    if (err.message === 'INVALID_PASSWORD')
      return ResError(res, 400, 'Provided password is incorrect');

    if (err.message === 'USER_NOT_FOUND')
      return ResError(res, 404, 'User not found');

    throw err;
  }
}, 'DeleteUser');