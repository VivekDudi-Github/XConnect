import { deleteFilesFromCloudinary } from '../../../utils/cloudinary.js';
import { supabaseDeleteHLSVideo } from '../../../utils/supabase.js';
import { softDeletePost , getThumbnails } from '../db/deletePost.db.js';

export const deletePostService = async ({ post }) => {
  if (post?.media?.length) {
    await deleteFilesFromCloudinary(post.media);
    const videoIds = post.media.filter(i => i.public_id && i.type === 'video') ;
    const videoThumbnails = await getThumbnails(videoIds);
    console.log(videoThumbnails , post.media)
    await supabaseDeleteHLSVideo(videoIds);
    await deleteFilesFromCloudinary(videoThumbnails.map(i => i?.poster));
  }

  await softDeletePost(post);


  return true;
};
