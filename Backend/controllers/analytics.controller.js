import { ObjectId } from "mongodb";
import { Following } from "../models/following.model.js";
import { WatchHistory } from "../models/watchHistory.model.js";
import { Payout} from "../models/payout.model.js";
import { Post } from "../models/post.model.js";
import { TryCatch , ResError , ResSuccess } from "../utils/extra.js";



const getAnalyticsPage = TryCatch(async(req , res) => {
  const userId = req.user._id ;
  const Month = 30 * 24 * 3600 * 1000 ;

  const thisMonthReach = await getUserReach(userId , new Date(Date.now() - Month) , Date.now()) ;
  const lastMonthReach = await getUserReach(userId , new Date(Date.now() - 2*Month) , new Date(Date.now() - Month)) ;
  
  const payouts = await getPendingPayouts(userId) ;

  const topEngagedPosts = await WatchHistory.aggregate([
    {$match : {
      author : new ObjectId(`${userId}`) ,
      createdAt : {$gte : new Date(Date.now() - Month)} ,
    }} ,
    {$group : {
      _id : '$post' ,
      count : {$sum : 1} ,
    }} ,
    {$sort : {
      count : -1 ,
    }} ,
    {$limit : 10} ,
    {$lookup : {
      from : 'posts' ,
      localField : '_id' ,
      foreignField : '_id' ,
      as : 'postDetails' ,
    }} ,
    {$unwind : {path : '$postDetails' , preserveNullAndEmptyArrays : false}} ,
    {$addFields : {
      author : '$postDetails.author' ,
      content : '$postDetails.content' ,
      title : '$postDetails.title' ,
      createdAt : '$postDetails.createdAt' ,
      engagement : '$postDetails.engagements' ,
    }} ,
    {$project : {
      postDetails : 0 ,
    }}
  ]) ;

  const followerGraphData = await getFollowerGraphData(new Date( Month * 3) , Date.now() , userId) ;

  return ResSuccess(res , 200 , {
    thisMonthReach ,
    lastMonthReach ,
    payouts ,
    topEngagedPosts ,
    followerGraphData ,
  })
} , 'getAnalyticsPage')

const getPostReach = async(id , startTime , endTime) => {
  if(!ObjectId.isValid(id)) return ;

  const reach = await WatchHistory.aggregate([
    {$match : {
      $expr : {
        $and : [
          {$eq : ['$post' , new ObjectId(`${id}`)]} ,
          {$gte : ['$createdAt' , startTime]} ,
          {$lte : ['$createdAt' , endTime]} ,
        ]
      }
    }} ,
    {$group : {
      _id : '$_id' ,
      count : {$sum : 1} ,
    }}
  ])
  return reach ;
}

const getUserReach = async(id , startTime , endTime) => {
  if(!ObjectId.isValid(id)) return ;

  let match = {
    author : new ObjectId(`${id}`) ,
    createdAt : {$lte : endTime} ,
  } ;

  if(startTime) match.createdAt.$gte = startTime ;

  const reach = await WatchHistory.aggregate([
    {$match : match} ,
    {$group : {
      _id : '$_id' ,
      count : {$sum : 1} ,
    }}
  ])

  return reach ;
}

const getFollowers = async(id , startTime , endTime) => {
  if(!ObjectId.isValid(id)) return ;

  const reach = await Following.aggregate([
    {$match : {
      $expr : {
        $and : [
          {$eq : ['$followedTo' , new ObjectId(`${id}`)]} ,
          {$gte : ['$createdAt' , startTime]} ,
          {$lte : ['$createdAt' , endTime]} ,
        ]
      }
    }} ,
    {$group : {
      _id : '$_id' ,
      count : {$sum : 1} ,
    }}
  ])

  return reach ;
}

const getPendingPayouts = async(userId) => {
  const LastPayout = await Payout.findOne().sort({createdAt : -1}) ;

  const getAllViews = await getUserReach(userId, LastPayout?.createdAt , Date.now()) ;

  return getAllViews*0.5 ;
}

const getFollowerGraphData = async(startTime , endTime , userId) => {
  const followers = await Following.aggregate([
    {$match : {
      followedTo : new ObjectId(`${userId}`) ,
      createdAt: {
        $gte: startTime,
        $lte: endTime
      }
    }} ,
    {$group : {
      _id : {
        $dateTrunc: {
          date: '$createdAt',
          unit: 'day' ,
        }
      } ,
      count : {$sum : 1} ,
    }}
  ])
  return followers ;
}


export {
  getAnalyticsPage ,
}