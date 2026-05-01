// seed/index.js
import mongoose from 'mongoose';
import { seedComments , seedFollows , seedLikes , seedPosts , seedUsers , seedCommunity , seedCommunityComments , seedCommunityPosts} from './seed.js';
import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';
import { Likes } from '../models/likes.model.js';
import { Following } from '../models/following.model.js';
import { User } from '../models/user.model.js';
import { Community } from '../models/community.model.js';
import { Notification } from '../models/notification.model.js';

async function seed() {
  // await mongoose.connect(process.env.MONGO_URI);

  // await mongoose.connection.db.dropDatabase(); 

  try {
      const users = await seedUsers(User);
      const posts = await seedPosts(Post, users);
      const communities = await seedCommunity(Community, users);
      const postCommunity = await seedCommunityPosts(Post,users , communities)
      
      const comments = await seedComments(Comment, users, posts, Notification);
      const communityComments = await seedCommunityComments(Comment, users, postCommunity, Notification);
      await seedLikes(Likes, users, posts , [...comments , ...communityComments], Notification);
      await seedFollows(Following, users, Notification);
    
      console.log("Seeding complete");
      process.exit();
  } catch (error) {
    console.log('error while seeding' , error);
  }
}
export {seed}