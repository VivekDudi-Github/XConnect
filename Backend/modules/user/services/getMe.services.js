import { getMeDB } from "../db/getMe.db.js";

export const getMeService = async (userId) => {
  const user = await getMeDB(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};