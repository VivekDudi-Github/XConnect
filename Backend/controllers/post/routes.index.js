import { createPost } from './controller/createPost.controller.js';
import { deletePost } from './controller/deletePost.controller.js'
import { editPost } from './controller/editPost.controller.js';
import { toggleOnPost , increasePostViews } from './controller/toggleOnPost.controller.js';
import { getPost } from './controller/getPost.contorller.js';
import { getUserPosts } from './controller/getUserPosts.controller.js';
import { fetchFeedPost } from './controller/fetchFeedPosts.controller.js';  
import { fetchExplorePost  } from './controller/explore.controller.js';


export {
  createPost ,
  deletePost ,
  editPost ,
  toggleOnPost ,
  increasePostViews ,
  getPost ,
  getUserPosts ,
  fetchFeedPost ,
  fetchExplorePost ,
}