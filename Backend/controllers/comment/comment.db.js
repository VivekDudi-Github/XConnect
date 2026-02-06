import { Types } from "mongoose";
import { Comment } from "../../models/comment.model.js";
import { Likes } from "../../models/likes.model.js";
import { Dislikes } from "../../models/dislikes.model.js";
import { Post } from "../../models/post.model.js";

const ObjectId = Types.ObjectId;

/* ---------- BASIC ---------- */

export const findCommentById = (id) =>
  Comment.findById(id).select("user isDeleted content createdAt").populate("user" , "avatar username fullname");

export const commentExists = (id) =>
  Comment.exists({ _id: id, isDeleted: false });

export const createComment = (data) =>
  Comment.create(data);

export const getPostAuthorId = (postId) =>
  Post.findById(postId).select("author").then((post) => post.author);

/* ---------- LIKE / DISLIKE ---------- */

export const userLikedComment = (comment, user) =>
  Likes.exists({ comment, user });

export const userDislikedComment = (comment, user) =>
  Dislikes.exists({ comment, user });

export const removeLike = (comment, user) =>
  Likes.deleteOne({ comment, user });

export const removeDislike = (comment, user) =>
  Dislikes.deleteOne({ comment, user });

export const addLike = (comment, user) =>
  Likes.create({ comment, user });

export const addDislike = (comment, user) =>
  Dislikes.create({ comment, user });

export const deleteAllLikes = (comment) => 
  Likes.deleteMany({comment : comment._id}) ;
  
export const deleteAllDislikes = (comment) => 
  Dislikes.deleteMany({comment : comment._id}) ;

/* ---------- AGGREGATIONS ---------- */

export const getCommentsAggregate = ({
  postId,
  userId,
  skip,
  limit,
  sortStages,
  replyMatch,
}) =>
  Comment.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ["$post", new ObjectId(`${postId}`)] },
            ...replyMatch,
          ],
        },
      },
    },

    { $lookup: { from: "likes", localField: "_id", foreignField: "comment", as: "likes" } },
    { $lookup: { from: "dislikes", localField: "_id", foreignField: "comment", as: "dislikes" } },

    ...sortStages,
    { $skip: Number(skip) },
    { $limit: Number(limit) },

    {//author
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        pipeline: [{ $project: { avatar: 1, username: 1, fullname: 1 } }],
        as: "author",
      },
    },

    {//user like
      $lookup: {
        from: "likes",
        let: { cid: "$_id" },
        pipeline: [
          { $match: { $expr: { $and: [
            { $eq: ["$comment", "$$cid"] },
            { $eq: ["$user", new ObjectId(`${userId}`)] },
          ]}}},
        ],
        as: "userLike",
      },
    },

    {$lookup : {
      from : 'dislikes' ,
      let : { commentId : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$comment' , '$$commentId']} ,
              {$eq : ['$user' , new ObjectId(`${userId}`)]} ,
            ]
          }
        }} ,
      ] ,
      as : 'userDislike' ,
    }} ,

    {//replydetails
      $lookup : {
        from : 'comments' ,
        let : { commentId : '$_id'} ,
        pipeline : [
          {$match : {
            $expr : {
              $and : [
                {$eq : ['$post' , new ObjectId(`${postId}`)]} ,
                {$eq : ['$replyTo' , 'comment']} ,
                {$eq : ['$comment_id' , '$$commentId']} ,
              ]
            }
          }} ,
          {$project : {
            _id : 1
          }}
        ] ,
        as : 'replyDetails'
      }
    },

    {//add feilds
      $addFields: {
        replyCount : {$size : '$replyDetails'} ,
        author : '$author' ,
        likeCount: { $size: "$likes" },
        dislikeCount: { $size: "$dislikes" } ,
        likeStatus: { $gt: [{ $size: "$userLike" }, 0] },
        dislikeStatus : { $gt : [{ $size : '$userDislike'} , 0 ]}  ,
      },
    },

    { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    { $project: {
      userDetails : 0 ,
      totalLike : 0 ,
      totalDislike : 0 ,
      userLike : 0 ,
      userDislike : 0 ,
     } },
  ]);

export const getACommentAggregate = ({ id }) =>
  Comment.aggregate([
    { $match: { _id: new ObjectId(`${id}`) } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        pipeline: [{ $project: { avatar: 1, username: 1, fullname: 1 } }],
        as: "author",
      },
    },
  ]);