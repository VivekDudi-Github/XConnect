import {
  findUserById,
  updateUserPassword,
} from '../db/changePass.db.js';

export const deleteUserService = async ({ userId, password }) => {
  const user = await findUserById(userId);
  if (!user || user.isDeleted) {
    throw new Error('USER_NOT_FOUND');
  }

  const isValid = await user.IsPasswordCorrect(password);
  if (!isValid) {
    throw new Error('INVALID_PASSWORD');
  }

  await markUserAsDeleted(user);
};