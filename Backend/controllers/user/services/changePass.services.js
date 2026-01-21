import bcrypt from 'bcryptjs';
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

export const changePasswordService = async ({
  userId,
  oldPassword,
  newPassword,
}) => {
  const user = await findUserById(userId);
  if (!user || user.isDeleted) {
    throw new Error('USER_NOT_FOUND');
  }

  const isValid = await user.IsPasswordCorrect(oldPassword);
  if (!isValid) {
    throw new Error('INVALID_PASSWORD');
  }

  const salt = await bcrypt.genSalt(15);
  const hashed = await bcrypt.hash(newPassword, salt);

  await updateUserPassword(user, hashed);
};
