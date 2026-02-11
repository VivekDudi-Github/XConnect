import mongoose from 'mongoose';
import {User} from '../../models/user.model.js' ;
import {Community} from '../../models/community.model.js';
import {Post} from '../../models/post.model.js';


const ObjectId = mongoose.Types.ObjectId;

/* AUTOCOMPLETE*/
export const searchUsersAutocomplete = (q) =>
  User.aggregate([
    {
      $search: {
        index: 'autocomplete_users',
        autocomplete: {
          query: q,
          path: 'username',
          fuzzy: { maxEdits: 2, prefixLength: 2 }
        }
      }
    },
    { $limit: 10 },
    { $project: { name: '$username' } }
  ]);

export const searchCommunitiesAutocomplete = (q) =>
  Community.aggregate([
    {
      $search: {
        index: 'communities',
        text: {
          query: q,
          path: 'name',
          fuzzy: { maxEdits: 2, prefixLength: 2 }
        }
      }
    },
    { $limit: 10 },
    { $project: { name: 1 } }
  ]);

/* POSTS */
export const searchPosts = (q, skip, limit, userId) =>
  Post.aggregate([
    {
      $search: {
        index: 'post',
        compound: {
        must: [
          {
            text: {
              query: q,
              path: 'content',
              fuzzy: { maxEdits: 2, prefixLength: 2 }
            }
          } ,
        ],
        mustNot: [
          {
            equals: {
              path: "isDeleted",
              value: true
            }
          }
        ]
      }
      }
    },
    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' },

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
                  { $eq: ['$user', new ObjectId(`${userId}`)] }
                ]
              }
            }
          }
        ],
        as: 'userLike'
      }
    },

    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'post',
        as: 'likes'
      }
    },

    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'post',
        as: 'comments'
      }
    },

    {
      $addFields: {
        likeStatus: { $gt: [{ $size: '$userLike' }, 0] },
        likeCount: { $size: '$likes' },
        commentCount: { $size: '$comments' }
      }
    },

    {
      $project: {
        content: 1,
        media: 1,
        createdAt: 1,
        views: 1,
        author: { username: 1, avatar: 1 },
        likeStatus: 1,
        likeCount: 1,
        commentCount: 1
      }
    }
  ]);

export const searchPostsAggregates = (q) =>
  Post.aggregate([
    {$searchMeta : {
      index : 'post' ,
      compound: {
      must: [
        {
          text: {
            query: q,
            path: 'content',
            fuzzy: { maxEdits: 2, prefixLength: 2 }
          }
        }
      ],
      mustNot: [
        {
          equals: {
            path: "isDeleted",
            value: true
          }
        }
      ]
    }}}
  ])


/* USERS */
export const searchUsers = (q, skip, limit, userId) =>
  User.aggregate([
    {
      $search: {
        index: 'autocomplete_users',
        autocomplete: {
          query: q,
          path: 'username',
          fuzzy: { maxEdits: 2, prefixLength: 2 }
        }
      }
    },
    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: 'followings',
        let: { uid: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$followedBy', new ObjectId(userId)] },
                  { $eq: ['$followedTo', '$$uid'] }
                ]
              }
            }
          }
        ],
        as: 'followings'
      }
    },

    {$lookup : {
      from : 'followings' , 
      localField : '_id' ,
      foreignField : 'followedTo' ,
      as : 'totalFollowers'
    }} ,

    {
      $addFields: {
        isFollowing: { $gt: [{ $size: '$followings' }, 0] },
        totalFollowers : {$size : '$totalFollowers'} ,
      }
    },

    {
      $project: {
        username: 1,
        avatar: 1,
        fullname: 1,
        isFollowing: 1 ,
        totalFollowers : 1 ,
      }
    }
  ]);

export const searchUsersAggregates = (q) =>
  User.aggregate([
    {$searchMeta : {
      index : 'autocomplete_users' ,
      autocomplete : {
        query : q , 
        path : 'username' , 
        fuzzy : {
          maxEdits : 2 , 
          prefixLength : 2
      }}
    }}
  ])
  

/* COMMUNITIES */
export const searchCommunities = (q, skip, limit, userId) =>
  Community.aggregate([
    {
      $search: {
        index: 'communities',
        text: {
          query: q,
          path: ['name', 'description'],
          fuzzy: { maxEdits: 2, prefixLength: 2 }
        }
      }
    },
    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: 'followings',
        let: { cid: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$followedBy', new ObjectId(`${userId}`)] },
                  { $eq: ['$followingCommunity', '$$cid'] }
                ]
              }
            }
          }
        ],
        as: 'followings'
      }
    },

    {
      $lookup : {
        from : 'followings' ,
        foreignField : 'followingCommunity' ,
        localField : '_id' ,
        as : 'followings' ,
      }
    } ,

    {
      $addFields: {
        isFollowing: { $gt: [{ $size: '$followings' }, 0] } ,
        totalFollowers : {$size : '$followings'} ,
      }
    },

    {
      $project: {
        name: 1,
        avatar: 1,
        description: 1,
        isFollowing: 1,
        totalFollowers : 1
      }
    }
  ]);

export const searchCommunitiesAggregates = (q) =>
  Community.aggregate([
    {$searchMeta : {
      index : 'communities' ,
      text : {
        query : q , 
        path : ['name' , 'description'] , 
        fuzzy : {
          maxEdits : 2 , 
          prefixLength : 2
        }
      }
    }}
  ])
 