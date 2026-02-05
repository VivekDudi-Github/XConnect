import { uploadFilesTOCloudinary } from '../../../utils/cloudinary.js';
import {
  createPostDB,
  getValidVideos,
  getMentionOps,
  saveMentions,
  incrementHashtags,
} from '../db/createPost.db.js';
import { emitEvent } from '../../../utils/socket.js';
import { NOTIFICATION_RECEIVE } from '../../../utils/constants/notification.socketEvent.js';

export const createPostService = async ({user,body,files}) => {
  const {
    content,
    hashtags,
    mentions,
    title,
    community,
    isCommunityPost,
    repost,
    scheduledAt,
    category,
    isAnonymous,
    videoIds = [],
  } = body;

  const mediaFiles = files?.media || [];

  const uploadedMedia = mediaFiles.length
    ? await uploadFilesTOCloudinary(mediaFiles)
    : [];

  const videos = videoIds.length
    ? await getValidVideos(videoIds, user._id)
    : [];

  const post = await createPostDB({
    author: user._id,
    content,
    media: [...uploadedMedia, ...videos],
    hashtags,
    repost: repost || null,
    scheduledAt: scheduledAt || null,
    mentions,
    community: isCommunityPost ? community : null,
    title: isCommunityPost ? title : null,
    category: isCommunityPost ? category : null,
    isAnonymous: isCommunityPost ? isAnonymous ?? false : false ,
    type: isCommunityPost ? 'community' : 'post',
  });

  const mentionOps = await getMentionOps(mentions, post._id, user._id);
   
  await Promise.all([
    saveMentions(mentionOps),
    incrementHashtags(hashtags),
  ]);
  
  mentionOps.forEach(op => {
    emitEvent(
      NOTIFICATION_RECEIVE,
      'user',
      [`${op.insertOne.document.receiver}`],
      {
        type: 'mention',
        post: post._id,
        sender: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      }
    );
  });

  return post;
};
