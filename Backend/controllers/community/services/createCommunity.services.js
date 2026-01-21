import {
  createCommunity,
  followCommunity,
} from '../db/createCommunity.db.js';

import {
  uploadFilesTOCloudinary,
  deleteFilesFromCloudinary 
} from '../../../utils/cloudinary.js';

export const createCommunityService = async ({
  userId,
  body,
  files,
}) => {
  const { avatar, banner } = files;

  const avatarUpload = await uploadFilesTOCloudinary(avatar);
  const bannerUpload = await uploadFilesTOCloudinary(banner);

  try {
    const community = await createCommunity({
      ...body,
      avatar: avatarUpload[0],
      banner: bannerUpload[0],
      creator: userId,
    });

    await followCommunity({
      communityId: community._id,
      userId,
    });

    return community;
  } catch (err) {
    // cleanup uploaded media if DB fails
    await deleteFilesFromCloudinary([
      avatarUpload[0],
      bannerUpload[0],
    ]);

    throw err;
  }
};
