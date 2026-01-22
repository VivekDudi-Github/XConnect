import { analyticsRepo } from "./analytics.db.js";

const MONTH = 30 * 24 * 60 * 60 * 1000;

export async function getAnalyticsDashboard(userId) {
  const now = Date.now();

  const [
    thisMonthReach,
    lastMonthReach,
    followersThisMonth,
    followersLastMonth,
    topPosts,
    followerGraph,
    scheduledPosts,
    scheduledLives,
    likes,
    comments,
    lastPayout,
  ] = await Promise.all([
    analyticsRepo.getUserReach(userId, new Date(now - MONTH), new Date()),
    analyticsRepo.getUserReach(userId, new Date(now - 2 * MONTH), new Date(now - MONTH)),
    analyticsRepo.getFollowers(userId, new Date(now - MONTH), new Date()),
    analyticsRepo.getFollowers(userId, new Date(now - 2 * MONTH), new Date(now - MONTH)),
    analyticsRepo.getTopEngagedPosts(userId, new Date(now - MONTH)),
    analyticsRepo.getFollowerGraph(userId, new Date(now - 3 * MONTH), new Date()),
    analyticsRepo.getScheduledPosts(userId),
    analyticsRepo.getScheduledLives(userId),
    analyticsRepo.getLikeCount(userId),
    analyticsRepo.getCommentCount(userId, new Date(now - MONTH)),
    analyticsRepo.getLastPayout(),
  ]);

  const payoutViews =
    lastPayout
      ? (await analyticsRepo.getUserReach(userId, lastPayout.createdAt, new Date()))[0]?.count ?? 0
      : 0;

  return {
    thisMonthReach,
    lastMonthReach,
    followersThisMonth: followersThisMonth[0]?.count ?? 0,
    followersLastMonth: followersLastMonth[0]?.count ?? 0,
    topPosts,
    followerGraph,
    scheduledPosts,
    scheduledLives,
    likes: likes[0]?.count ?? 0,
    comments: comments[0]?.count ?? 0,
    pendingPayout: payoutViews * 0.5,
  };
}
