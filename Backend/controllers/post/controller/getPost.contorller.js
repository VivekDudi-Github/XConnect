import { TryCatch , ResError ,ResSuccess } from "../../../utils/extra.js";
import { validateGetPost } from "../validator/getPost.validator.js";
import { getPostService } from "../services/getPost.services.js";


export const getPost = TryCatch(async (req, res) => {
  const valid = await validateGetPost(req, res);
  if (!valid) return;

  const post = await getPostService({
    postId: req.params.id,
    viewer: req.user,
  });

  if (!post) return ResError(res, 404, 'Post not found.');

  ResSuccess(res, 200, post);
}, 'GetPost');
