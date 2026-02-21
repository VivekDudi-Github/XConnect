import { deleteFilesFromCloudinary } from '../../../utils/cloudinary.js';
import { supabaseDeleteHLSVideo } from '../../../utils/supabase.js';
import { softDeletePost } from '../db/deletePost.db.js';

export const deletePostService = async ({ post }) => {
  if (post?.media?.length) {
    await deleteFilesFromCloudinary(post.media);
    await supabaseDeleteHLSVideo(post.media.filter(i => i.public_id && i.type === 'video'))
  }

  await softDeletePost(post);


  return true;
};
