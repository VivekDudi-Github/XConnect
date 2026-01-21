import { Post } from '../../../models/post.model.js';
import { ObjectId } from 'mongodb';

export const getCommunityFeedAggregation = ({
  userId,
  hashtags,
  limit,
}) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 4);

  return Post.aggregate([
    {
      $lookup: {
        from: 'followings',
        let: { userId: new ObjectId(userId) },
        pipeline: [
          { $match: { $expr: { $eq: ['$followedBy', '$$userId'] } } },
          { $project: { followingCommunity: 1, followedTo: 1 } },
        ],
        as: 'following',
      },
    },
    {
      $addFields: {
        communityFollowIds: { $map: { input: '$following', as: 'f', in: '$$f.followingCommunity' } },
        userFollowIds: { $map: { input: '$following', as: 'f', in: '$$f.followedTo' } },
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ['$isDeleted', false] },
            { $eq: ['$type', 'community'] },
            {
              $or: [
                { $gte: ['$createdAt', threeDaysAgo] },
                { $in: ['$author', '$userFollowIds'] },
                { $in: ['$hashtags', hashtags] },
              ],
            },
          ],
        },
      },
    },
    { $sample: { size: limit } },
  ]);
};
