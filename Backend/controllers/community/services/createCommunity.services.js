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

  let avatarUpload , bannerUpload ;
  if(process.env.NODE_ENV !== 'TEST') {
    avatarUpload = await uploadFilesTOCloudinary(files?.avatar);
    bannerUpload = await uploadFilesTOCloudinary(files?.banner);
  }else {
    avatarUpload = [{public_id : 'avatar' , url : 'url' , type : 'image'}]  ;
    bannerUpload = [{public_id : 'banner' , url : 'url' , type : 'image'}]  ;
  }

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
    console.log('---error-- while creating community service' ,err );
    // cleanup uploaded media if DB fails
    await deleteFilesFromCloudinary([
      avatarUpload?.[0],
      bannerUpload?.[0],
    ]);

    throw err;
  }
};
