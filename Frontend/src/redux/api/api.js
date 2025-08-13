import {createApi , fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { CreativeCommonsIcon } from 'lucide-react';


const api = createApi({
  reducerPath : 'api' ,
  baseQuery : fetchBaseQuery({baseUrl : 'http://localhost:3000/api/v1'}),
  tagTypes : ['Room' , 'Messages' , 'User' , 'Post' , ] ,

  endpoints : (builder) => ({
//users
    fetchMe : builder.query({
      query : () => ({
        url : '/user/me' ,
        credentials : 'include'
      })
    }) ,
    registerMe : builder.mutation({
      query : (body) => ({
        url : '/user/signup' ,
        method : 'POST' ,
        body : body ,
        credentials : 'include' 
      }) ,
    }) ,
    loginMe : builder.mutation({
      query : (body) => ({
        url : 'user/login' ,
        method : 'POST' ,
        credentials : 'include' ,
        body : body ,
      })
    }) ,
    updateProfile : builder.mutation({
      query : (body) => ({
        url : '/user/me' ,
        method : 'PATCH' ,
        body : body ,
        credentials : 'include' ,
      }) 
    }) ,
    getProfile : builder.query({
      query : (username) => ({
        url : `/user/${username}` ,
        credentials : 'include' ,
      })
    }) ,

//posts
    getPost: builder.query({
      query : (id) => ({
        url : `/post/${id}` ,
        credentials : 'include' ,
      }) ,
    }) ,
    createPost : builder.mutation({
      query : (data) => ({
        url : '/post' ,
        method : 'POST' ,
        body : data ,
        credentials : 'include' ,
      })
    }) ,
    deletePost : builder.mutation({
      query : (id) => ({
        url : `/post/${id}` ,
        method : 'DELETE' ,
        credentials : 'include' ,
      }) 
    }) ,
    editPost : builder.mutation({
      query : ({id , ...data}) => ({
        url : `/post/${id}` ,
        method : 'PATCH' ,
        body : data ,
        credentials : 'include' ,
      })
    }) ,

    getUserPosts : builder.query({
      query : ({page ,username , tab}) => ({
        url : `/post/user/?page=${page}&tab=${tab}&username=${username}` ,
        credentials : 'include' ,
      })
    }) ,
    toggleOnPost : builder.mutation({
      query : ({id , option}) => {
        return ({
        url : `/post/toggle/${id}` ,
        method : 'POST' ,
        body : {option : option} ,
        credentials : 'include'   
      })}
    }) ,
    
    getFeedPosts : builder.query({
      query : () => ({
        url : '/post/me/feed' ,
        credentials : 'include' ,
      })
    }) ,

//comments
    postComment : builder.mutation({
      query : ({postId , ...data}) => ({
        url : `/comment/${postId}` ,
        method : 'POST' ,
        body : data ,
        credentials : 'include' ,
      })
    }) ,
    getComment : builder.query({
      query : ({id , page , sortBy , isComment , comment_id }) => ({
        url : `/comment/post/${id}?page=${page}&sortBy=${sortBy}&isComment=${isComment}&comment_id=${comment_id}` ,
        credentials : 'include' ,
      })  
    }) ,
    toggleLikeComment : builder.mutation({
      query : ({id}) => ({
        url : `/comment/like/${id}` ,
        method : 'POST' ,
        credentials : 'include' ,
      })
    }) ,
    deleteComment : builder.mutation({
      query : ({id}) => ({
        url : `/comment/${id}` ,
        method : 'DELETE' ,
        credentials : 'include' ,
      })
    }) ,
    getAComment : builder.query({
      query : ({id}) => ({
        url : `/comment/${id}` ,
        credentials : 'include' ,
      })
    }) ,

    //follow
    toggleFollow : builder.mutation({
      query : ({id}) => ({
        url : `/user/${id}/follow` ,
        method : 'POST' ,
        credentials : 'include' ,
      })
    }) ,
    //notification 
    getMyNotifications : builder.query({
      query : () => ({
        url : '/user/me/notifications' ,
        credentials : 'include' ,
      })
    }) ,
    changeNotificationStatus : builder.mutation({
      query : ({notificationId}) => ({
        url : `/user/me/notifications` ,
        method : 'PATCH' ,
        body : {notificationId : [ ...notificationId]} ,
        credentials : 'include' ,
      })
    }) ,
    
    //room
    getRooms : builder.query({
      query : () => ({
        url : '/room/get' ,
        credentials : 'include' ,
      }) ,
       providesTags : ['Room'] ,
    }) ,
    createRoom : builder.mutation({
      query : (data) => ({
        url : '/room/create' ,
        method : 'POST' ,
        body : data ,
        credentials : 'include' ,
      })
    }) ,
    getMessages : builder.query({
      query : ({room , _id , limit}) => ({
        url : `/message/get?room=${room}&_id=${_id}&limit=${limit}` ,
        credentials : 'include' ,
      }) ,
      providesTags : (result , error , arg) => [
        {type : 'Messages' , id : `${arg.room}-${arg._id}`} ,
      ] ,
      keepUnusedDataFor : 60 * 60 , // 1 hour
    }) ,

    //community
    createCommunity : builder.mutation({
      query : (data) => ({
        url : '/community/create',
        method : 'POST' ,
        body : data ,
        credentials : 'include'
      })
    })
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

  useLazyGetUserPostsQuery,
  useToggleOnPostMutation ,
 
//feed
  useLazyGetFeedPostsQuery ,  

// comment
  usePostCommentMutation ,
  useLazyGetCommentQuery ,
  useToggleLikeCommentMutation ,
  useDeleteCommentMutation ,

  useLazyGetACommentQuery ,

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
  
} = api ;