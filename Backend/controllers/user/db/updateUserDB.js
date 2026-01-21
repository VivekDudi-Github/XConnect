import { User } from "../../../models/user.model.js";

export const updateUserDb = async (body) => {

  const user = await User.findByIdAndUpdate(body.userId, {
      ...body
  }, { 
    new : true , 
    omitUndefined : true , 
    runValidators: true  
  }).select("-password -refreshToken");

  return user;
};