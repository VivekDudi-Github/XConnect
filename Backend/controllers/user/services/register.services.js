import bcrypt from 'bcryptjs';
import { User } from '../../../models/user.model.js';

export const registerUserService = async ({
  username,
  email,
  password,
  fullname,
}) => {
  const emailExists = await User.exists({ email });
  if (emailExists) {
    throw new Error('EMAIL_EXISTS');
  }

  const usernameExists = await User.exists({ username });
  if (usernameExists) {
    throw new Error('USERNAME_TAKEN');
  }

  const salt = await bcrypt.genSalt(15);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    fullname,
    password: hashedPassword,
  });

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
  };
};
