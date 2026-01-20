import { User } from "../../../models/user.model.js";
import { ResError } from "../../../utils/extra.js";

export const validateGetUserPosts = async (req, res) => {
  const { username } = req.query;

  if (!username) return ResError(res, 400, 'Username is required.');

  const user = await User.findOne({ username }).select('_id');
  if (!user) return ResError(res, 400, 'User not found.');

  req.targetUserId = user._id;
  return true;
};
