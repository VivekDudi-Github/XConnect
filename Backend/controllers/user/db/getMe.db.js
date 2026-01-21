import { ObjectId } from 'mongodb';
import { User } from '../../../models/user.model.js';

export const getMeDB = async (userId) => {
  const result = await User.aggregate([
    {
      $match: {
        _id: new ObjectId(userId),
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
      },
    },
    // followers
    {
      $lookup: {
        from: 'followings',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$followedTo', '$$userId'] },
            },
          },
        ],
        as: 'followers',
      },
    },
    // following
    {
      $lookup: {
        from: 'followings',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$followedBy', '$$userId'] },
            },
          },
        ],
        as: 'following',
      },
    },
    // posts
    {
      $lookup: {
        from: 'posts',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$author', '$$userId'] },
                  { $eq: ['$isDeleted', false] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: 'posts',
      },
    },
    {
      $addFields: {
        followers: { $size: '$followers' },
        following: { $size: '$following' },
        posts: { $size: '$posts' },
      },
    },
  ]);

  return result[0] || null;
};
