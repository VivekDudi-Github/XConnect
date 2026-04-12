import {ResError , ResSuccess ,TryCatch} from '../../../utils/extra.js';
import { createPostService } from '../services/createPost.services.js';
import { validateCreatePost } from '../validator/createPost.validator.js';

export const createPost = TryCatch(async (req, res) => {
  req.CreateMediaForDelete = [];

  const media = req.files?.media || [];
  media.forEach(file => req.CreateMediaForDelete.push(file));

  const valid = await validateCreatePost(req, res);

  if((media?.length ?? 0) + (req?.body?.videoIds?.length ?? 0) > 5)  
    return ResError(res, 400, 'You can only upload up to 5 media files per post.'); 
  
  if (valid !== true ) return;

  const post = await createPostService({
    user: req.user,
    body: req.body,
    files: req.files,
  });

  if (!post) return ResError(res, 500, 'Post could not be created.');

  ResSuccess(res, 201, post);
}, 'CreatePost');

