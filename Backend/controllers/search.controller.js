import {TryCatch , ResError , ResSuccess} from '../utils/extra.js'

import { User } from '../models/user.model.js'
import { Post } from '../models/post.model.js';

const search = TryCatch(async (req , res) => {
  const {q ,page = 1 ,limit = 20 } = req.params ;
  if(!q) return ResError(res , 400 , 'Search query is required')
  
  let skip = (page -1) * limit ;

  const posts = await Post.find({$text : {$search : q}}) ;
  const users = await User.find({$text : {$search : q}}) ;

  return ResSuccess( res , 200 , {users })
} , 'search')

const searchUsers = TryCatch(async(req ,res) => {
  const {q ,page = 1 ,limit = 20 } = req.query ;
  if(!q) return ResError(res , 400 , 'Search query is required')
  console.log(q);
  
  let skip = (page -1) * limit ;
  const users = await User.aggregate([
    {$match : {$text : {$search : q}}} ,
    {$skip : skip} ,
    {$limit : limit} ,
    {$lookup : {
      from : 'followings' ,
      let : {userId : '$_id'} ,
      pipeline : [
        {$match : {$expr : {$eq : ['$followedBy' , '$$userId']}}}
      ] ,
      as : 'followings' ,
    }} ,
    {$addFields : {
      isFollowing : {$gt : [{$size : '$followings'} , 0]}
    }} ,
    {$project : {
      fullname : 1 ,
      username : 1 ,
      name : 1 ,
      avatar : 1 ,
      isFollowing : 1 ,
    }}
  ])
  console.log(users);
  
  return ResSuccess( res , 200 , {results : users , page})
} , 'searchUsers')

export {
  search , 
  searchUsers ,
}
