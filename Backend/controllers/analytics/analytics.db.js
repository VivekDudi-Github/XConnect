import { ObjectId } from "mongodb";
import {WatchHistory} from "../../models/watchHistory.model.js";
import {Following} from "../../models/following.model.js";
import {Payout} from "../../models/payout.model.js";
import {Post} from "../../models/post.model.js";
import {LiveStream} from "../../models/liveStream.model.js";
import {LikesCount} from "../../models/likesCount.model.js";
import {CommentCount} from "../../models/commentCount.model.js";

export const analyticsRepo = {
  getUserReach(userId, start, end) {
    return WatchHistory.aggregate([
      {
        $match: {
          author: new ObjectId(userId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]);
  },

  getFollowers(userId, start, end) {
    return Following.aggregate([
      {
        $match: {
          followedTo: new ObjectId(userId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$followedTo", count: { $sum: 1 } } },
    ]);
  },

  getTopEngagedPosts(userId, since) {
    return WatchHistory.aggregate([
      { $match: { author: new ObjectId(userId), createdAt: { $gte: since } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "_id",
          as: "post",
        },
      },
      { $unwind: "$post" },
      {
        $project: {
          _id: 1,
          count: 1,
          title: "$post.title",
          content: "$post.content",
          createdAt: "$post.createdAt",
          engagement: "$post.engagements",
          views: "$post.views",
        },
      },
    ]);
  },

  getFollowerGraph(userId, start, end) {
    return Following.aggregate([
      {
        $match: {
          followedTo: new ObjectId(userId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateTrunc: { date: "$createdAt", unit: "day" },
          },
          count: { $sum: 1 },
        },
      },
    ]);
  },

  getScheduledPosts(userId) {
    return Post.find({
      author: userId,
      scheduledAt: { $gt: new Date() },
    })
      .select("scheduledAt content title")
      .sort({ scheduledAt: 1 })
      .limit(5);
  },

  getScheduledLives(userId) {
    return LiveStream.find({ host: new ObjectId(userId) })
      .sort({ scheduledAt: 1 })
      .limit(5);
  },

  getLikeCount(userId) {
    return LikesCount.aggregate([
      { $match: { user: new ObjectId(userId) } },
      { $group: { _id: "$user", count: { $sum: "$count" } } },
    ]);
  },

  getCommentCount(userId, since) {
    return CommentCount.aggregate([
      {
        $match: {
          user: new ObjectId(userId),
          createdAt: { $gte: since },
        },
      },
      { $group: { _id: "$user", count: { $sum: "$count" } } },
    ]);
  },

  getLastPayout() {
    return Payout.findOne().sort({ createdAt: -1 });
  },
};
