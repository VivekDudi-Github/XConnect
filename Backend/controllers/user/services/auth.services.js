import { User } from '../../../models/user.model.js';

export const loginUserService = async ({
  email,
  username,
  password,
}) => {
  const user = await User.findOne({
    $or: [
      email ? { email } : null,
      username ? { username } : null,
    ].filter(Boolean),
  });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isPasswordCorrect = await user.IsPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user, userObj };
};
