import { User } from '../../../models/user.model.js';
import { Following } from '../../../models/following.model.js';
import {LiveStream} from '../../../models/liveStream.model.js'

const OneDay = 24 * 60 * 60 * 1000;

export const getUserProfileAggregate = (username) => {
  return User.aggregate([
    { $match: { username } },

    {
      $project: {
        refreshToken: 0,
        password: 0,
        email: 0,
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

    // posts count
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
};

export const checkIsFollowing = (targetUserId, viewerId) => {
  return Following.exists({
    followedTo: targetUserId,
    followedBy: viewerId,
  });
};

export const checkIsLive = (userId) => {
  return LiveStream.exists({
    host : userId ,
    isLive : true ,
  })
}