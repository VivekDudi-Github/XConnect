import { deleteFilesFromCloudinary } from '../../../utils/cloudinary.js';
import { deleteHLSVideo } from '../../../utils/supabase.js';
import { softDeletePost } from '../db/deletePost.db.js';

export const deletePostService = async ({ post }) => {
  if (post?.media?.length) {
    await deleteFilesFromCloudinary(post.media);
    await deleteHLSVideo(post.media.map(i => i.public_id))
  }

  await softDeletePost(post);


  return true;
};
