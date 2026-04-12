import { User } from "../../../models/user.model.js";

export const findUserById = (userId) => {
  return User.findById(userId);
};

export const updateUserPassword = (user, hashedPassword) => {
  user.password = hashedPassword;
  return user.save();
};
