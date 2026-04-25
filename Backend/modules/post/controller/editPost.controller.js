import { TryCatch , ResSuccess } from '../../../utils/extra.js';
import { editPostService } from '../services/editPost.services.js';
import { validateEditPost } from '../validator/editPost.validator.js';


export const editPost = TryCatch(async (req, res) => {
  req.CreateMediaForDelete = [];

  const media = [...(req.files?.media || [])];
  media?.forEach(file => req.CreateMediaForDelete.push(file));


  const valid = await validateEditPost(req, res);
  if (valid !== true) return;

  const post = await editPostService({
    post: req.post,
    body: req.body,
    media: req.media,
  });

  return ResSuccess(res, 200, post);
}, 'EditPost');