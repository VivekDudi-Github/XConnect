import { Bookmark } from "../../../models/bookmark.model.js";
import { Comment } from "../../../models/comment.model.js";
import { Likes } from "../../../models/likes.model.js";
import { Post } from "../../../models/post.model.js";
import { ObjectId } from "mongodb";
import { WatchHistory } from "../../../models/watchHistory.model.js";



const fetchUserPosts = async ({viewerId, authorId , limit, skip }) => {
  let totalPages ;
  if (skip === 0) {
    const total = await Post.countDocuments({ author: authorId , isDeleted : false });
    totalPages = Math.ceil(total / limit);
  }

  const isMe = authorId.equals(viewerId);

  const scheduleFilter = isMe
    ? [{ scheduledAt: { $exists: true } }, { scheduledAt: null }]
    : [
        { scheduledAt: { $exists: false } },
        { scheduledAt: null },
        { scheduledAt: { $lt: new Date() } },
      ];

  const posts = await Post.aggregate([
    {
      $match: {
        author: new ObjectId(`${authorId}`),
        isDeleted: false,
        $or: scheduleFilter,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },

    //author details
    {$lookup : {
      from : 'users' ,
      let : { userId : new ObjectId(`${authorId}`)} ,
      pipeline : [
        {
          $match : {
            $expr : {
              $eq : [ '$_id' , '$$userId']
            }
          }
        } ,
        {
          $project : {
            avatar : 1 ,
            username : 1 ,
            fullname : 1 ,
          }
        }
      ] ,
      as : 'authorDetails'
    }} , 
    //repost
    {$lookup : {
      from : 'reposts' ,
      let : {'repostsId' : '$repost' } ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$repostsId']
          }
        }} ,
        {$lookup : {
          from : 'users' ,
          let : { userId : '$author' } ,
          pipeline : [
            {
              $match : {
                $expr : {
                  $eq : [ '$_id' , '$$userId']
                }
              }
            } ,
            {
              $project : {
                avatar : 1 ,
                username : 1 ,
                fullname : 1 ,
              }
            }
          ] ,
          as : 'authorDetails'
        }} ,
        {$addFields : {
          author : '$authorDetails' 
        }} ,
        {$unwind : '$author'}
      ] ,
      as : 'repostDetails'
    }} ,

  // check your post like status,
    {$lookup : {
      from : 'likes' ,
      let : {'postId' : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$post' , '$$postId']} ,
              {$eq : ['$user' , new ObjectId(`${authorId}`)]}
            ]
          }
        }}
      ] ,
      as : 'userLike'
    }} ,
    //userBookmark
    {$lookup : {
      from : 'bookmarks' ,
      let : {'postId' : '$_id'} ,
      pipeline : [
        {
          $match : {
            $expr : {
              $and : [
                {$eq : ['$post' , '$$postId']} ,
                {$eq : ['$user' , new ObjectId(`${authorId}`)]}
              ]
            }
          }
        }
      ] , 
      as : 'userBookmark'
    }} ,
    //totalLike
    {$lookup : {
      from : 'likes' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'likesArray' ,
    }} ,
    //totalComments
    {$lookup : {
      from : 'comments' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'totalComments' ,
    }} ,


    {$addFields : {
      isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
      likeCount :{ $size : '$likesArray'} , 
      repost : '$repostDetails' , 
      author : '$authorDetails' ,
      commentCount : {$size : '$totalComments'} ,
    }} ,
    
    {$project : {
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
    }} ,

    {$unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    {$unwind: { path: "$repost", preserveNullAndEmptyArrays: true } },
  ]);

  return { posts, totalPages };
};

const fetchReplies = async( { viewerId ,authorId , limit , skip}) => {
  let totalPages ;
  if (skip === 0) {
   const totalPost  = await Comment.countDocuments({user : authorId , isDeleted : false}) ;
   totalPages = Math.ceil(totalPost/limit) ;
  }

const posts = await Comment.aggregate([
  {$match : {
    user : new ObjectId(`${authorId}`) 
  }} ,
  {$sort : {
    createdAt : -1 
  }} ,
  { $skip : skip} ,
  { $limit : limit} ,
  
  //mycomment author
  {$lookup : {
    from : 'users' ,
    let : { userId : '$user'} ,
    pipeline : [
      {$match : {
        $expr : {
          $eq : ['$_id' , '$$userId']
        }
      }} ,
      {$project : {
        avatar : 1 ,
        username : 1 ,
        fullname : 1 ,
      }}
    ] ,
    as : 'myCommentAuthorDetails'
  }} ,

  //comment
  {$lookup : {
    from : 'comments' ,
    let : { commentId : '$comment_id'} ,
    pipeline : [
      {$match : {
        $expr : {
          $eq : [ '$_id' , '$$commentId']
        }
      }} ,
      //author
      {$lookup : {
        from : 'users' , 
        let : {userId : '$user'} ,
        pipeline : [
          {$match : {
            $expr : {
              $eq : ['$_id' , '$$userId']
            }
          }} , 
          {$project : {
            avatar : 1 ,
            username : 1 ,
            fullname : 1
          }}
        ] , 
        as : 'authorDetails'
      }} ,
      //likes , like status , comment count
      {$lookup : {
        from : 'likes' ,
        let : { commentId : '$_id'} ,
        pipeline : [
          {$match : {
            $expr : {
              $and : [
                {$eq : ['$comment' , '$$commentId']} ,
                {$eq : ['$user' , new ObjectId(`${authorId}`)]}
              ]
            }
          }}
        ] ,
        as : 'userLike'
      }} ,
      //totalLike
      {$lookup : {
        from : 'likes' ,
        localField : '_id' ,
        foreignField : 'comment' ,
        as : 'totalLike' ,
      }} ,
      //totalComments
      {$lookup : {
        from : 'comments' ,
        localField : '_id' ,
        foreignField : 'comment_id' ,
        as : 'totalComments' ,
      }} ,

      {$addFields : {
        author : { $arrayElemAt: ['$authorDetails' , 0]} ,
        commentCount : {$size : '$totalComments'} ,
        likeCount : {$size : '$totalLike'} ,
        likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
      }} ,
      {$project : { 
        userLike : 0 ,
        totalLike : 0 ,
        authorDetails : 0 ,
        totalComments : 0 ,
      }}
    ] , 
    as : 'commentDetailsRaw'
  }} ,
  //post 
  {$lookup : {
    from : 'posts' ,
    let : { postId : '$post'} ,
    pipeline : [
      {$match : {
        $expr : {
          $eq : [ '$_id' , '$$postId']
        }
      }} ,
      //author
      {$lookup : {
        from : 'users' , 
        let : {userId : '$author'} ,
        pipeline : [
          {$match : {
            $expr : {
              $eq : ['$_id' , '$$userId']
            }
          }} , 
          {$project : {
            avatar : 1 ,
            username : 1 ,
            fullname : 1
          }}
        ] , 
        as : 'authorDetails'
      }} , 
      //repost
      {$lookup : {
        from : 'posts' ,
        let : {postId : '$repost'} ,
        pipeline : [
          {$match : {
            $expr : {
              $eq : ['$_id' , '$$postId']
            }
          }} , 
          //repost author
          {$lookup : {
            from : 'users' , 
            let : {userId : '$author'} ,
            pipeline : [
              {$match : {
                $expr : {
                  $eq : ['$_id' , '$$userId']
                }
              }} , 
              {$project : {
                avatar : 1 ,
                username : 1 ,
                fullname : 1
              }}
            ] , 
            as : 'repostAuthorDetails'
          }} , 
          {$addFields : {
            author : { $arrayElemAt: ['$repostAuthorDetails' , 0]} ,
          }} ,
        ] ,
        as : 'repostDetails'
      }} ,
      //userlike
      {$lookup : {
        from : 'likes' ,
        let : {'postId' : '$_id'} ,
        pipeline : [
          {$match : {
            $expr : {
              $and : [
                {$eq : ['$post' , '$$postId']} ,
                {$eq : ['$user' , new ObjectId(`${authorId}`)]}
              ]
            }
          }}
        ] ,
        as : 'userLike'
      }} ,
      //userBookmark
      {$lookup : {
        from : 'bookmarks' ,
        let : {'postId' : '$_id'} ,
        pipeline : [
          {
            $match : {
              $expr : {
                $and : [
                  {$eq : ['$post' , '$$postId']} ,
                  {$eq : ['$user' , new ObjectId(`${authorId}`)]}
                ]
              }
            }
          }
        ] , 
        as : 'userBookmark'
      }} ,
      //totalLike
      {$lookup : {
        from : 'likes' ,
        localField : '_id' ,
        foreignField : 'post' ,
        as : 'likesArray' ,
      }} ,
      //totalComments
      {$lookup : {
        from : 'comments' ,
        localField : '_id' ,
        foreignField : 'post' ,
        as : 'totalComments' ,
      }} ,
  

      {$addFields : {
        author : { $arrayElemAt: ['$authorDetails' , 0]} ,
        repost : { $arrayElemAt: ['$repostDetails' , 0]} ,
        isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
        likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
        likeCount :{ $size : '$likesArray'} , 
        commentCount : {$size : '$totalComments'} ,
      }} , 
      {$project : { 
        userLike : 0 ,
        isDeleted : 0 ,
        likesArray : 0 ,
        userBookmark : 0 ,
        authorDetails : 0 ,
        repostDetails : 0 ,
        totalComments : 0 ,
      }}
    ] ,
    as : 'postDetailsRaw' ,
  }} ,



  {$addFields: {
      author : { $arrayElemAt: ['$myCommentAuthorDetails' , 0]} ,
      postDetails: {
        $cond: {
          if: { $eq: ["$replyTo", "post"] },
          then: { $arrayElemAt: ["$postDetailsRaw", 0] },
          else: null
        }
      },
      commentDetails: {
        $cond: {
          if: { $eq: ["$replyTo", "comment"] },
          then: { $arrayElemAt: ["$commentDetailsRaw", 0] },
          else: null
        }
      }
    }
  } ,
  {$project : {
    postDetailsRaw : 0 ,
    commentDetailsRaw : 0 ,
  }}


]) ;
 return {posts , totalPages} ;
}

const fetchHistory = async({authorId ,viewerId , limit , skip}) => {
  let totalPages ;
  if (skip === 0) {
    let result  = await countPipeline(WatchHistory , authorId) ;
    let totalPost = result[0]?.total || 0 ;

    totalPages = Math.ceil(totalPost/limit) ;
  }

  const posts = await WatchHistory.aggregate([
    {$match : {
      user : new ObjectId(`${authorId}`) ,
    }} ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,

    //main-post
    {$lookup : {
      from : 'posts' ,
      let : { postId : '$post'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$postId']
          }
        }} ,
        //author
        {$lookup : {
          from : 'users' , 
          let : {userId : '$author'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$userId']
              }
            }} , 
            {$project : {
              avatar : 1 ,
              username : 1 ,
              fullname : 1
            }}
          ] , 
          as : 'authorDetails'
        }} , 
        //repost
        {$lookup : {
          from : 'posts' ,
          let : {postId : '$repost'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$postId']
              }
            }} , 
            //repost author
            {$lookup : {
              from : 'users' , 
              let : {userId : '$author'} ,
              pipeline : [
                {$match : {
                  $expr : {
                    $eq : ['$_id' , '$$userId']
                  }
                }} , 
                {$project : {
                  avatar : 1 ,
                  username : 1 ,
                  fullname : 1
                }}
              ] , 
              as : 'repostAuthorDetails'
            }} , 
            {$addFields : {
              author : { $arrayElemAt: ['$repostAuthorDetails' , 0]} ,
            }} ,
          ] ,
          as : 'repostDetails'
        }} ,
        //user like
        {$lookup : {
          from : 'likes' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {$match : {
              $expr : {
                $and : [
                  {$eq : ['$post' , '$$postId']} ,
                  {$eq : ['$user' , new ObjectId(`${authorId}`)]}
                ]
              }
            }}
          ] ,
          as : 'userLike'
        }} ,
        //userBookmark
        {$lookup : {
          from : 'bookmarks' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {
              $match : {
                $expr : {
                  $and : [
                    {$eq : ['$post' , '$$postId']} ,
                    {$eq : ['$user' , new ObjectId(`${authorId}`)]}
                  ]
                }
              }
            }
          ] , 
          as : 'userBookmark'
        }} ,
        //totalLike
        {$lookup : {
          from : 'likes' ,
          localField : '_id' ,
          foreignField : 'post' ,
          as : 'likesArray' ,
        }} ,
        //totalComments
        {$lookup : {
          from : 'comments' ,
          localField : '_id' ,
          foreignField : 'post' ,
          as : 'totalComments' ,
        }} ,
        {$addFields : {
          author : { $arrayElemAt: ['$authorDetails' , 0]} ,
          repost : { $arrayElemAt: ['$repostDetails' , 0]} ,
          isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
          likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
          likeCount :{ $size : '$likesArray'} , 
          commentCount : {$size : '$totalComments'} ,
        }}
      ] ,
      as : 'postDetails' ,
    }} ,

    {$unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },

    {$replaceRoot : {
      newRoot : {
        $mergeObjects: ['$$ROOT' , '$postDetails']
      }
    }},
    {$unset : 'postDetails'},

    {$project : { 
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
      totalComments : 0 ,
    }}
  ])

  return {posts , totalPages} ;
}

const fetchLikes = async({authorId, viewerId , limit , skip}) => {
  let totalPages ;
  if (skip === 0) {
    let result  = await countPipeline(Likes , authorId) ;
    let totalPost = result[0]?.total || 0 ;
    totalPages = Math.ceil(totalPost/limit) ;
  }
  
  const posts = await Likes.aggregate([
    {$match : {
      user : new ObjectId(`${authorId}`) ,
      post : {$ne : null} , 
    }} ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,
    
    //post
    {$lookup : {
      from : 'posts' ,
      let : { postId : '$post'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$postId']
          }
        }} ,
        //author
        {$lookup : {
          from : 'users' , 
          let : {userId : '$author'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$userId']
              }
            }} , 
            {$project : {
              avatar : 1 ,
              username : 1 ,
              fullname : 1
            }}
          ] , 
          as : 'authorDetails'
        }} , 
        //repost
        {$lookup : {
          from : 'posts' ,
          let : {postId : '$repost'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$postId']
              }
            }} , 
            //repost author
            {$lookup : {
              from : 'users' , 
              let : {userId : '$author'} ,
              pipeline : [
                {$match : {
                  $expr : {
                    $eq : ['$_id' , '$$userId']
                  }
                }} , 
                {$project : {
                  avatar : 1 ,
                  username : 1 ,
                  fullname : 1
                }}
              ] , 
              as : 'repostAuthorDetails'
            }} , 
            {$addFields : {
              author : { $arrayElemAt: ['$repostAuthorDetails' , 0]} ,
            }} ,
          ] ,
          as : 'repostDetails'
        }} ,
        //userlike
        {$lookup : {
          from : 'likes' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {$match : {
              $expr : {
                $and : [
                  {$eq : ['$post' , '$$postId']} ,
                  {$eq : ['$user' , new ObjectId(`${authorId}`)]}
                ]
              }
            }}
          ] ,
          as : 'userLike'
        }} ,
        //userBookmark
        {$lookup : {
          from : 'bookmarks' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {
              $match : {
                $expr : {
                  $and : [
                    {$eq : ['$post' , '$$postId']} ,
                    {$eq : ['$user' , new ObjectId(`${authorId}`)]}
                  ]
                }
              }
            }
          ] , 
          as : 'userBookmark'
        }} ,
        //totalLike
        {$lookup : {
          from : 'likes' ,
          localField : '_id' ,
          foreignField : 'post' ,
          as : 'likesArray' ,
        }} ,
        //totalComments
        {$lookup : {
          from : 'comments' ,
          localField : '_id' ,
          foreignField : 'post' ,
          as : 'totalComments' ,
        }} ,
    

        {$addFields : {
          author : { $arrayElemAt: ['$authorDetails' , 0]} ,
          repost : { $arrayElemAt: ['$repostDetails' , 0]} ,
          isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
          likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
          likeCount :{ $size : '$likesArray'} , 
          commentCount : {$size : '$totalComments'} ,
        }}
      ] ,
      as : 'postDetails' ,
    }} ,

    {$unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },

    {$replaceRoot: { 
      newRoot: {
        $mergeObjects: ['$$ROOT' , '$postDetails']
      }
    }},
    
    {$unset : 'postDetails'} ,

    {$project : { 
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
      totalComments : 0 ,
    }} ,
  ])
  return { posts ,totalPages} ;
}

const fetchBookmarkedPosts = async({ authorId, viewerId , limit , skip}) => { 
  let totalPages ;
  if (skip === 0) {
    let result  = await countPipeline(Bookmark , authorId) ;
    let totalPost = result[0]?.total || 0 ;  
    totalPages = Math.ceil(totalPost/limit) ;
  }
  const posts = await Bookmark.aggregate([
    {$match : {
      user : new ObjectId(`${authorId}`) ,
    }} ,
    {$sort : {
      createdAt : -1 
    }} ,
    { $skip : skip} ,
    { $limit : limit} ,

    //main-post
    {$lookup : {
      from : 'posts' ,
      let : { postId : '$post'} ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$postId']
          }
        }} ,
        //author
        {$lookup : {
          from : 'users' , 
          let : {userId : '$author'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$userId']
              }
            }} , 
            {$project : {
              avatar : 1 ,
              username : 1 ,
              fullname : 1
            }}
          ] , 
          as : 'authorDetails'
        }} , 
        //repost
        {$lookup : {
          from : 'posts' ,
          let : {postId : '$repost'} ,
          pipeline : [
            {$match : {
              $expr : {
                $eq : ['$_id' , '$$postId']
              }
            }} , 
            //repost author
            {$lookup : {
              from : 'users' , 
              let : {userId : '$author'} ,
              pipeline : [
                {$match : {
                  $expr : {
                    $eq : ['$_id' , '$$userId']
                  }
                }} , 
                {$project : {
                  avatar : 1 ,
                  username : 1 ,
                  fullname : 1
                }}
              ] , 
              as : 'repostAuthorDetails'
            }} , 
            {$addFields : {
              author : { $arrayElemAt: ['$repostAuthorDetails' , 0]} ,
            }} ,
          ] ,
          as : 'repostDetails'
        }} ,
        //user like
        {$lookup : {
          from : 'likes' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {$match : {
              $expr : {
                $and : [
                  {$eq : ['$post' , '$$postId']} ,
                  {$eq : ['$user' , new ObjectId(`${authorId}`)]}
                ]
              }
            }}
          ] ,
          as : 'userLike'
        }} ,
        //userBookmark
        {$lookup : {
          from : 'bookmarks' ,
          let : {'postId' : '$_id'} ,
          pipeline : [
            {
              $match : {
                $expr : {
                  $and : [
                    {$eq : ['$post' , '$$postId']} ,
                    {$eq : ['$user' , new ObjectId(`${authorId}`)]}
                  ]
                }
              }
            }
          ] , 
          as : 'userBookmark'
        }} ,
        //totalLike
        {$lookup : {
          from : 'likes' ,
          localField : '_id' ,
          foreignField : 'post' ,
          as : 'likesArray' ,
        }} ,
        //totalComments
        {$lookup : {
          from : 'comments' ,
          localField : '_id' ,
          foreignField : 'post' ,
          as : 'totalComments' ,
        }} ,
        {$addFields : {
          author : { $arrayElemAt: ['$authorDetails' , 0]} ,
          repost : { $arrayElemAt: ['$repostDetails' , 0]} ,
          isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
          likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
          likeCount :{ $size : '$likesArray'} , 
          commentCount : {$size : '$totalComments'} ,
        }}
      ] ,
      as : 'postDetails' ,
    }} ,

    {$unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },

    {$replaceRoot : {
      newRoot : {
        $mergeObjects: ['$$ROOT' , '$postDetails']
      }
    }},
    {$unset : 'postDetails'},

    {$project : { 
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
      totalComments : 0 ,
    }}
  ])

  return {posts , totalPages} ;
}

const fetchMediaPosts = async({authorId , viewerId , limit , skip}) => {
  let totalPages ;
  if (skip === 0) {
      const total = await Post.countDocuments({ author: authorId , isDeleted: false , media : {$exists : true , $ne : []}}) ;
      totalPages = Math.ceil(total / limit);    
  }
  const isMe = authorId.equals(viewerId);

  const scheduleFilter = isMe
    ? [{ scheduledAt: { $exists: true } }, { scheduledAt: null }]
    : [
        { scheduledAt: { $exists: false } },
        { scheduledAt: null },
        { scheduledAt: { $lt: new Date() } },
      ];

  const posts = await Post.aggregate([
    {
      $match: {
        author: new ObjectId(`${authorId}`),
        isDeleted: false,
        $or: scheduleFilter,
        $expr : {
          $gte: [{ $size: "$media" }, 1]
        }
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },

    //author details
    {$lookup : {
      from : 'users' ,
      let : { userId : new ObjectId(`${authorId}`)} ,
      pipeline : [
        {
          $match : {
            $expr : {
              $eq : [ '$_id' , '$$userId']
            }
          }
        } ,
        {
          $project : {
            avatar : 1 ,
            username : 1 ,
            fullname : 1 ,
          }
        }
      ] ,
      as : 'authorDetails'
    }} , 
    //repost
    {$lookup : {
      from : 'reposts' ,
      let : {'repostsId' : '$repost' } ,
      pipeline : [
        {$match : {
          $expr : {
            $eq : [ '$_id' , '$$repostsId']
          }
        }} ,
        {$lookup : {
          from : 'users' ,
          let : { userId : '$author' } ,
          pipeline : [
            {
              $match : {
                $expr : {
                  $eq : [ '$_id' , '$$userId']
                }
              }
            } ,
            {
              $project : {
                avatar : 1 ,
                username : 1 ,
                fullname : 1 ,
              }
            }
          ] ,
          as : 'authorDetails'
        }} ,
        {$addFields : {
          author : '$authorDetails' 
        }} ,
        {$unwind : '$author'}
      ] ,
      as : 'repostDetails'
    }} ,

  // check your post like status,
    {$lookup : {
      from : 'likes' ,
      let : {'postId' : '$_id'} ,
      pipeline : [
        {$match : {
          $expr : {
            $and : [
              {$eq : ['$post' , '$$postId']} ,
              {$eq : ['$user' , new ObjectId(`${authorId}`)]}
            ]
          }
        }}
      ] ,
      as : 'userLike'
    }} ,
    //userBookmark
    {$lookup : {
      from : 'bookmarks' ,
      let : {'postId' : '$_id'} ,
      pipeline : [
        {
          $match : {
            $expr : {
              $and : [
                {$eq : ['$post' , '$$postId']} ,
                {$eq : ['$user' , new ObjectId(`${authorId}`)]}
              ]
            }
          }
        }
      ] , 
      as : 'userBookmark'
    }} ,
    //totalLike
    {$lookup : {
      from : 'likes' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'likesArray' ,
    }} ,
    //totalComments
    {$lookup : {
      from : 'comments' ,
      localField : '_id' ,
      foreignField : 'post' ,
      as : 'totalComments' ,
    }} ,


    {$addFields : {
      isBookmarked : { $gt : [{ $size : '$userBookmark'} , 0 ]} ,
      likeStatus : { $gt : [{ $size : '$userLike'} , 0 ]} ,
      likeCount :{ $size : '$likesArray'} , 
      repost : '$repostDetails' , 
      author : '$authorDetails' ,
      commentCount : {$size : '$totalComments'} ,
    }} ,
    
    {$project : {
      userLike : 0 ,
      isDeleted : 0 ,
      likesArray : 0 ,
      userBookmark : 0 ,
      authorDetails : 0 ,
      repostDetails : 0 ,
    }} ,

    {$unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    {$unwind: { path: "$repost", preserveNullAndEmptyArrays: true } },
  ]);

  return { posts, totalPages };
}

export const TAB_HANDLERS = {
  Posts: fetchUserPosts,
  Replies: fetchReplies,
  Likes: fetchLikes,
  History: fetchHistory,
  BookMarks: fetchBookmarkedPosts,
  Media : fetchMediaPosts  ,
};

async function countPipeline(model , authorId){
  return model.aggregate([
    {$match : {
      user : new ObjectId(`${authorId}`) ,
    }} ,
    {$lookup : {
      from : 'posts' ,
      foreignField : '_id' ,
      localField : 'post' ,
      as : 'postData'
    }} ,
    {$unwind : '$postData'} ,
    {$match : {
      'postData.isDeleted' : false ,
    }} ,
    {$count : 'total'}
  ])
}