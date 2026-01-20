import { Post } from '../../../models/post.model.js';
import { WatchHistory } from '../../../models/watchHistory.model.js';
import { ObjectId } from 'mongodb';

export const getPostMeta = (id) =>
  Post.findById(id).select('author scheduledAt isDeleted');

export const getPostAggregate = (postId, userId) => {
  return Post.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ['$_id', new ObjectId(postId)] },
            { $eq: ['$isDeleted', false] },
          ],
        },
      },
    },

    /* community */
    {
      $lookup: {
        from: 'communities',
        let: { communityId: '$community' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$communityId'] } } },
          { $project: { name: 1, avatar: 1 } },
        ],
        as: 'communityDetails',
      },
    },

    /* author */
    {
      $lookup: {
        from: 'users',
        let: { userId: '$author' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
          { $project: { avatar: 1, username: 1, fullname: 1 } },
        ],
        as: 'authorDetails',
      },
    },

    /* repost */
    {
      $lookup: {
        from: 'posts',
        let: { repostId: '$repost' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$repostId'] },
                  { $eq: ['$isDeleted', false] },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              let: { userId: '$author' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                { $project: { avatar: 1, username: 1, fullname: 1 } },
              ],
              as: 'authorDetails',
            },
          },
          { $addFields: { author: { $arrayElemAt: ['$authorDetails', 0] } } },
          { $project: { author: 1, content: 1, media: 1, hashtags: 1 } },
        ],
        as: 'repostDetails',
      },
    },

    /* likes & bookmarks */
    {
      $lookup: {
        from: 'likes',
        let: { postId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$post', '$$postId'] },
                  { $eq: ['$user', new ObjectId(userId)] },
                ],
              },
            },
          },
        ],
        as: 'userLike',
      },
    },
    {
      $lookup: {
        from: 'bookmarks',
        let: { postId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$post', '$$postId'] },
                  { $eq: ['$user', new ObjectId(userId)] },
                ],
              },
            },
          },
        ],
        as: 'userBookmark',
      },
    },

    { $lookup: { from: 'likes', localField: '_id', foreignField: 'post', as: 'likesArray' } },
    { $lookup: { from: 'bookmarks', localField: '_id', foreignField: 'post', as: 'bookmarksArray' } },

    {
      $addFields: {
        likeStatus: { $gt: [{ $size: '$userLike' }, 0] },
        bookmarkStatus: { $gt: [{ $size: '$userBookmark' }, 0] },
        likeCount: { $size: '$likesArray' },
        bookmarkCount: { $size: '$bookmarksArray' },
        author: { $arrayElemAt: ['$authorDetails', 0] },
        community: { $arrayElemAt: ['$communityDetails', 0] },
        repost: { $arrayElemAt: ['$repostDetails', 0] },
      },
    },

    {
      $project: {
        userLike: 0,
        userBookmark: 0,
        likesArray: 0,
        bookmarksArray: 0,
        authorDetails: 0,
        communityDetails: 0,
        repostDetails: 0,
        isDeleted: 0,
      },
    },
  ]);
};

export const incrementPostEngagement = (postId) =>
  Post.findByIdAndUpdate(postId, { $inc: { engagements: 1 } });

export const updateWatchHistory = async ({ postId, userId, authorId }) => {
  await WatchHistory.deleteOne({ post: postId, user: userId });
  await WatchHistory.create({ post: postId, user: userId, author: authorId });
};
