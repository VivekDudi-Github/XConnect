import { faker } from '@faker-js/faker';

export async function seedUsers(UserModel) {
  const users = [];

  for (let i = 0; i < 15; i++) {
    users.push({
      username: faker.internet.username(),
      email: faker.internet.email(),
      avatar:{
        url : faker.image.avatar(),
        public_Id : faker.string.uuid(),
      } ,
      password : "$2b$15$9iD57eHLWsRs6NByGC9QH.WHYS7RI9KOxOopaDGB8aCCV2BisNzji",
      fullname: faker.person.fullName(),
      bio : faker.lorem.sentence(),
      location : faker.location.city(),
      role: 'user',
      banner : {
        url : faker.image.avatar() ,
        public_Id : faker.string.uuid() ,
      } , 
    });
  }

  const createdUsers = await UserModel.insertMany(users);
  return createdUsers;
}

export async function seedPosts(PostModel, users) {
  const posts = [];

  for (const user of users) {
    const count = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < count; i++) {
      posts.push({
        author: user._id,
        content: faker.lorem.sentence().slice(0, 270),
        type: 'post',
        views : Math.floor(Math.random() * 1000) ,
        media : Math.random() < 0.5 ? [{
          url : faker.image.url({width: 500 , height : 500}) ,
          public_id : faker.string.uuid() ,
          type : 'image' ,
        }] : [] ,
        createdAt : faker.date.recent({days: 30}) ,
      });
    }
  }

  const createdPosts = await PostModel.insertMany(posts);
  return createdPosts;
}

export async function seedCommunity(CommunityModel, users) {
  const communities = [];

  for (let i = 0 ; i < 10 ; i++) {
    const count = Math.floor(Math.random() * 3) + 1;
    const random = Math.floor(Math.random() * users.length) ;
    for (let i = 0; i < count; i++) {
      communities.push({
        name: faker.person.jobTitle(),
        avatar: {
          url: faker.image.avatar(),
          public_id: faker.string.uuid(),
        },
        banner: {
          url: faker.image.avatar(),
          public_Id: faker.string.uuid(),
        },
        tagline: faker.lorem.sentence().slice(0, 10),
        description: faker.lorem.paragraph(),
        creator: users[random]._id,
        admins: [users[random]._id],
        followers: Math.floor(Math.random() * 100),
        rules: Array.from({ length: 5 }, () => faker.lorem.sentence()),  
        tags: [faker.lorem.word()],
        createdAt : faker.date.recent({days : 30}),
      });
    }
  }
  
  const createdCommunities = await CommunityModel.insertMany(communities);
  return createdCommunities;
}


export async function seedCommunityPosts(PostModel, users, communities) {
  const posts = [];

  for (const user of users) {
    const count = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < count; i++) {
    const randomCommunity = Math.floor(Math.random() * communities.length) ;
      posts.push({
        createdAt : faker.date.recent({days: 30}),
        author: user._id,
        title: faker.lorem.sentence() ,
        content: faker.lorem.sentences().slice(0, 270),
        type: 'community',
        views : Math.floor(Math.random() * 1000) ,
        community : communities[randomCommunity]._id ,
        media : [{
          url : faker.image.url({width: 500 , height : 500}) ,
          public_id : faker.string.uuid() ,
          type : 'image' ,
        }]  ,
        createdAt : faker.date.recent({days: 15}) ,
      });
    }
  }

  const createdPosts = await PostModel.insertMany(posts);
  return createdPosts;
}

export async function seedComments(CommentModel, users, posts, NotificationModel) {
  const comments = [];
  const notifications = [];

  for (const post of posts) {
    const count = Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];

      comments.push({
        createdAt : faker.date.recent({days : 20}) ,
        post: post._id,
        replyTo: 'post',
        user: user._id,
        content: faker.lorem.sentence(),
      });
      notifications.push({
        receiver: post.author,
        sender: user._id,
        type: 'comment',
        desc: `${user.username} commented on your post.`,
        post: post._id,
        createdAt: faker.date.recent({days: 60})
      })
    }
  }
  
  await NotificationModel.insertMany(notifications);
  return await CommentModel.insertMany(comments);
}

export async function seedCommunityComments(CommentModel, users, posts, NotificationModel) {
  const comments = [];
  const notifications = []

  for (const post of posts) {
    const count = Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];

      comments.push({
        post: post._id,
        replyTo: 'post',
        user: user._id,
        content: faker.lorem.sentence(),
        createdAt: faker.date.recent(20)
      });
      notifications.push({
        receiver: post.author,
        sender: user._id,
        type: 'reply',
        desc: `${user.username} replied to your post.`,
        post: post._id,
        createdAt: faker.date.recent({days: 60})
      })
    }
  }
  await NotificationModel.insertMany(notifications);
  return await CommentModel.insertMany(comments);
}


export async function seedLikes(LikeModel, users, posts , comments, NotificationModel) {
  const likes = [];
  const commenLikes = [];
  const notifications = [];
  
  for (const post of posts) {
    const shuffled = faker.helpers.shuffle(users);

    for (const user of shuffled) {
      if ( Math.random() < 0.5 ) continue ;
      likes.push({
        post: post._id,
        user: user._id,
      });  
      notifications.push({
        receiver: post.author,
        sender: user._id,
        type: 'like',
        desc: `${user.username} liked your post.`,
        post: post._id,
        createdAt: faker.date.recent({days: 60})
      })
    }
  }
  for (const comment of comments) {
    if(Math.random() < 0.5) continue ;
    const shuffled = faker.helpers.shuffle(users);
    for (const user of shuffled) {
      commenLikes.push({
        comment: comment._id,
        user: user._id,
      });
    }
  }


  await LikeModel.insertMany([...likes, ...commenLikes]);
  await NotificationModel.insertMany(notifications);
}

export async function seedFollows(FollowModel, users, NotificationModel) {
  const follows = [];
  const notifications = [];
  
  for (const user of users) {
    const others = users.filter(u => u._id.toString() !== user._id.toString());

    const shuffled = others.sort(() => 0.5 - Math.random());
    const following = shuffled.slice(0, 5);

    for (const target of following) {
      follows.push({
        followedBy: user._id,
        followedTo: target._id,
        createdAt: faker.date.recent({days: 60})
      });
      notifications.push({
        receiver: target._id,
        sender: user._id,
        type: 'follow',
        desc: `${user.username} started following you.`,
        createdAt: faker.date.recent({days: 60})
      })
    }
  }
  await NotificationModel.insertMany(notifications);
  return await FollowModel.insertMany(follows);

}