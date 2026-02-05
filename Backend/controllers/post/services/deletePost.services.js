import { deleteFilesFromCloudinary } from '../../../utils/cloudinary.js';
import { softDeletePost } from '../db/deletePost.db.js';

export const deletePostService = async ({ post }) => {
  if (post?.media?.length) {
    await deleteFilesFromCloudinary(post.media);
  }

  await softDeletePost(post);

  return true;
};
