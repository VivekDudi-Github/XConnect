export const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
};