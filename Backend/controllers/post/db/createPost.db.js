import {Post} from '../../../models/post.model.js';
import {VideoUpload} from '../../../models/videoUpload.model.js';
import {User} from '../../../models/user.model.js';
import {Notification} from '../../../models/notifiaction.model.js';
import {Hashtag} from '../../../models/hastags.model.js';

export const createPostDB = (data) => Post.create(data);

export const getValidVideos = async (videoIds, userId) => {
  const videos = [];

  for (const id of videoIds) {
    const exists = await VideoUpload.exists({ public_id: id, user: userId });
    if (!exists) continue;

    videos.push({
      type: 'video',
      url: `/${id}/hsl/master.m3u8`,
      public_id: id,
    });
  }

  return videos;
};

export const getMentionOps = async (mentions, postId, senderId) => {
  if (!mentions.length) return [];
  console.log(mentions);
  const users = await User.find({ username: { $in: mentions } }).select('_id');
  
  return users
    .map(u => u._id.toString())
    .filter(id => id !== senderId.toString())
    .map(id => ({
      insertOne: {
        document: {
          type: 'mention',
          post: postId,
          sender: senderId,
          receiver: id,
        },
      },
    }));
};

export const saveMentions = (ops) =>
  ops.length && Notification.bulkWrite(ops, { ordered: false });

export const incrementHashtags = async (hashtags) => {
  if (!hashtags.length) return;

  await Hashtag.bulkWrite(
    hashtags.map(h => ({
      updateOne: {
        filter: { name: h },
        update: { $inc: { count: 1 } },
        upsert: true,
      },
    }))
  );
};
