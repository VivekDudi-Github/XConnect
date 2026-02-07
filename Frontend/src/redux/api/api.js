import {createApi , fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { userApi } from './user.api';
import { postApi } from './post.api';
import { commentApi } from './comment.api';
import { messagesApi } from './messages.api';
import { communityApi } from './community.api';
import { liveApi } from './live.api';
import { searchApi } from './search.api.';
import { videoUploadApi } from './videoUpload.api';


const api = createApi({
  reducerPath : 'api' ,
  baseQuery : fetchBaseQuery({baseUrl : 'http://localhost:3000/api/v1'}),
  tagTypes : ['Room' , 'Messages' , 'User' , 'Post' , 'UserPosts' ] ,

  endpoints : (builder) => ({
//users
    ...userApi(builder) ,

//posts
    ...postApi(builder) ,

//comments
    ...commentApi(builder) ,
    
//messages - message-rooms 
    ...messagesApi(builder) ,

//communities
    ...communityApi(builder) ,

//live
    ...liveApi(builder) ,

//search
    ...searchApi(builder) ,

//video-upload
    ...videoUploadApi(builder) ,
  
//notification 
    getMyNotifications : builder.query({
      query : () => ({
        url : '/user/me/notifications' ,
        credentials : 'include' ,
      }) , 
    }) ,
    changeNotificationStatus : builder.mutation({
      query : ({notificationId}) => ({
        url : `/user/me/notifications` ,
        method : 'PATCH' ,
        body : {notificationId : [ ...notificationId]} ,
        credentials : 'include' ,
      })
    }) ,
  
//analytics-page
    getAnalyticsPage : builder.query({
      query : () => ({
        url : '/analytics/home' ,
        credentials : 'include'
      }) ,
    } ,
  ) ,

  })
  
})

export default api ;

export const {
  endpoints ,
// profile-user
  useLazyFetchMeQuery ,
  useRegisterMeMutation ,
  useLoginMeMutation ,
  useUpdateProfileMutation ,
  useGetProfileQuery ,

//post
  useCreatePostMutation ,
  useEditPostMutation ,
  useDeletePostMutation ,
  useGetPostQuery ,

  useLazyGetTrendingQuery ,
  useLazyGetUserPostsQuery,
  useToggleOnPostMutation ,
  useIncreasePostViewsMutation ,

//feed
  useLazyGetFeedPostsQuery ,  

// comment
  usePostCommentMutation ,
  useLazyGetCommentQuery ,
  useToggleLikeCommentMutation ,
  useToggleDisLikeCommentMutation ,
  useDeleteCommentMutation ,
  useLazyGetACommentQuery ,
  useLazyGetCommunityIsInvitedQuery ,

  //follow
  useToggleFollowMutation ,
  
  //notifcations
  useLazyGetMyNotificationsQuery ,
  useChangeNotificationStatusMutation ,
  
  //room 
  useGetRoomsQuery ,
  useCreateRoomMutation ,

  //messages
  // useLazyGetMessagesQuery ,
  useGetMessagesQuery ,

  //community
  useCreateCommunityMutation ,
  useLazyGetCommunityFeedQuery ,
  useGetACommunityQuery ,
  useUpdateCommunityMutation ,
  useToggleFollowCommunityMutation ,
  useLazyGetCommunityPostsQuery ,
  useDeleteCommunityMutation ,
  useGetFollowingCommunityQuery ,
  //community-mods
  useInviteModsMutation ,
  useToggleJoinModMutation ,

  //live
  useCreateLiveMutation ,
  useUpdateLiveMutation ,
  useGetLiveStreamQuery ,
  useLazyGetLiveChatsQuery ,

  // superchat
  useCreateSuperchatIntentMutation ,

  //search
  useLazySearchUsersQuery ,
  useSearchBarMutation ,
  useLazyContinueSearchQuery ,
  useNormalSearchMutation ,

  //analytics
  useGetAnalyticsPageQuery ,

  //upload 
  useIntializeVideoUploadMutation ,
  useLazyUploadStatusCheckQuery ,

  useUploadVideoChunksMutation ,
  useVerifyUploadVideoMutation ,
} = api ;