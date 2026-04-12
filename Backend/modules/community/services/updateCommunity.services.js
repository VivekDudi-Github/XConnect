import { findCommunityById, saveCommunity } from '../db/community.db.js';
import { uploadFilesTOCloudinary, deleteFilesFromCloudinary } from '../../../utils/cloudinary.js';

export const updateCommunityService = async ({
  communityId,
  updates,
  files,
}) => {
  const community = await findCommunityById(communityId);
  if (!community) throw new Error('NOT_FOUND');

  let newAvatar;
  let newBanner;

  if (files?.avatar) {
    const result = await uploadFilesTOCloudinary(files.avatar);
    if (result?.length) {
      await deleteFilesFromCloudinary([community.avatar]);
      newAvatar = result[0];
    }
  }

  if (files?.banner) {
    const result = await uploadFilesTOCloudinary(files.banner);
    if (result?.length) {
      await deleteFilesFromCloudinary([community.banner]);
      newBanner = result[0];
    }
  }

  community.name = updates.name ?? community.name;
  community.description = updates.description ?? community.description;
  community.rules = updates.rules ?? community.rules;
  community.tags = updates.tags ?? community.tags;
  community.avatar = newAvatar ?? community.avatar;
  community.banner = newBanner ?? community.banner;

  await saveCommunity(community);

  return true;
};
