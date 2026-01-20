import { getPostAggregate , updateWatchHistory , incrementPostEngagement } from '../db/getPost.db.js';


export const getPostService = async ({ postId, viewer }) => {
  const result = await getPostAggregate(postId, viewer._id);
  if (!result.length) return null;

  const post = result[0];

  await incrementPostEngagement(postId);

  if (!post.author._id.equals(viewer._id)) {
    await updateWatchHistory({
      postId: post._id,
      userId: viewer._id,
      authorId: post.author._id,
    });
  }

  return post;
};
