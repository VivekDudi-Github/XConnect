import { User } from "../../../models/user.model.js";

export const findUserById = (userId) => {
  return User.findById(userId);
};

export const markUserAsDeleted = (user) => {
  user.isDeleted = true;
  user.deletedAt = new Date();
  return user.save();
};
