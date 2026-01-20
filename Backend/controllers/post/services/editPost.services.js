import { uploadFilesTOCloudinary, deleteFilesFromCloudinary } from '../../../utils/cloudinary.js';
import { saveEditedPost } from '../db/editPost.db.js';

export const editPostService = async ({
  post,
  body,
  media,
}) => {
  let uploadedMedia = [];

  if (post.media?.length) {
    await deleteFilesFromCloudinary(post.media);
  }

  if (media.length) {
    uploadedMedia = await uploadFilesTOCloudinary(media);
  }

  await saveEditedPost(post, {
    content: body.content,
    hashtags: body.hashtags,
    repost: body.repost || null,
    media: uploadedMedia,
  });

  return post;
};
