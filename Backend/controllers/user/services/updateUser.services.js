import { User } from "../../../models/user.model.js";
import { uploadFilesTOCloudinary , deleteFilesFromCloudinary } from "../../../utils/cloudinary.js";

export const updateUserService = async ({
  userId,
  body,
  files,
}) => {
  const { username } = body;
  const { avatar, banner } = files || {};

  let existing ;
  if (username) {
    existing = await User.findOne({ username });
    if (existing && !existing._id.equals(userId)) {
      throw new Error('USERNAME_TAKEN');
    }
  }

  let avatarResult;
  if (avatar?.length) {
    avatarResult = await uploadFilesTOCloudinary(avatar);
  }

  let bannerResult;
  if (banner?.length) {
    bannerResult = await uploadFilesTOCloudinary(banner);
  }

  if(bannerResult?.length) await deleteFilesFromCloudinary(existing.banner) ;
  if(avatarResult?.length) await deleteFilesFromCloudinary(existing.avatar) ; 
  

  const user = await updateUserDb({
    ...body ,  
    avatar: avatarResult ? avatarResult[0] : undefined,
    banner: bannerResult ? bannerResult[0] : undefined,
  })
    

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return {
    user,
    avatarUpdated: Boolean(avatarResult),
  };
};
