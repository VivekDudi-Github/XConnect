import {createApi , fetchBaseQuery} from '@reduxjs/toolkit/query/react'


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
      query : ({tab , page}) => ({
        url : '/post/me/feed/?tab='+tab+'&page='+page ,
        credentials : 'include' ,
      })
    }) ,
    getTrending : builder.query({
      query : (({tab ,page}) => {
        console.log("API hit" , tab , page);
        return {
        url : '/post/trending/' + '?tab=' +tab + '&page=' + page ,
        credentials : 'include'
      }}),
      providesTags : (result , error , arg) => {
        return [{type : 'Post' , id : `TRENDING-${arg.tab}-${arg.page}`}]
      } ,
      keepUnusedDataFor : 60* 5 , // 5 minutes
    }) ,
    increasePostViews : builder.mutation({
      query : ({id}) => ({
        url : `/post/increaseViews/${id}` ,
        method : 'POST' ,
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
      query : ({id , page , sortBy , isComment , limit = 5 , comment_id }) => ({
        url : `/comment/post/${id}?page=${page}&sortBy=${sortBy}&isComment=${isComment}&comment_id=${comment_id}&limit=${limit}` ,
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
    toggleDisLikeComment : builder.mutation({
      query : ({id}) => ({
        url : `/comment/dislike/${id}` ,
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
    }) ,
    getCommunityFeed : builder.query({
      query : ({page , limit = 2}) => ({
        url : '/community/feed/?page=' + page + '&limit=' + limit ,
        credentials : 'include'
      })
    }) ,
    getACommunity : builder.query({
      query : ({id}) =>({
        url : `/community/${id}` ,
        credentials : 'include'
      })
    }) ,
    updateCommunity : builder.mutation({
      query : ({data , id}) =>({
        url : '/community/update/' + id ,
        method : 'POST' ,
        body : data ,
        credentials : 'include'
      })
    }) ,
    toggleFollowCommunity : builder.mutation({
      query : ({id}) =>({
        url : '/community/follow/' + id ,
        method : 'POST' ,
        credentials : 'include'
      })
    }) ,
    getCommunityPosts : builder.query({
      query : ({id , page = 1 , limit = 1}) => ({
        url : '/community/posts/' + id ,
        method : 'GET' ,
        params : {
          page ,
          limit
        } ,
        credentials : 'include'
      })
    }) ,
    deleteCommunity : builder.mutation({
      query : ({id}) => ({
        url : '/community/delete/' + id ,
        method : 'DELETE' ,
        credentials : 'include'
      })
    }) ,
    getFollowingCommunity : builder.query({
      query : () => ({
        url : '/community/following' ,
        credentials : 'include'
      })
    }) ,
    //community mods
    inviteMods : builder.mutation({
      query : ({mods , communityId}) => ({
        url : '/community/invite-mods' ,
        method : 'POST' ,
        body : {mods , communityId} ,
        credentials : 'include'
      })
    }) ,
    getCommunityIsInvited : builder.query({
      query : ({id}) => ({
        url : '/community/is-invited/'+id ,
        credentials : 'include'
      })
    }) ,
    toggleJoinMod : builder.mutation({
      query : ({id}) => ({
        url : '/community/toggleMode/'+id ,
        method : 'POST' ,
        credentials : 'include'
      })
    }) ,

    //live
    createLive : builder.mutation({
      query : (data) => ({
        url : '/live/create' ,
        method : 'POST' ,
        body : data ,
        credentials : 'include'
      })
    }) ,
    updateLive : builder.mutation({
      query : ({id , ...data}) => ({
       url : '/live/update/'+id ,
       body : data ,
       method : 'PATCH' ,
       credentials : 'include' , 
      })
    }) ,
    getLiveStream : builder.query({
      query : ({id}) => {
        console.log('id' , id);
        
        return {
        url : `/live/get/${id}` ,
        credentials : 'include' ,
      }
      }
    }) ,
    getLiveChats : builder.query({
      query : ({id , limit , lastId }) => ({
        url : 'live/getChats/'+id+'?&limit='+limit + '&lastId='+lastId , 
        credentials : 'include' ,
      })
    }) ,

    createSuperchatIntent : builder.mutation({
      query : ({amount , message , streamId}) => ({
        url : '/stripe/payment/superchat/create' ,
        method : 'POST' ,
        body : {amount , message , streamId} ,
        credentials : 'include'
      })
    }) ,
    increaseLiveViews : builder.mutation({
      query : ({id}) => ({
        url : '/live/views/'+id ,
        method : 'POST' ,
        credentials : 'include'
      })
    }) ,

    //search
    searchUsers : builder.query({
      query : ({q , page }) => ({
        url : '/search/searchUsers/'+'?q='+q+'&page='+page ,
        method : 'GET' ,
        credentials : 'include'
      })
    }) ,
    searchBar : builder.mutation({
      query : ({q}) => ({
        url : '/search/searchbar/'+'?q='+q ,
        method : 'POST' ,
        credentials : 'include' ,
      }) , 
    }) ,
    normalSearch : builder.mutation({
      query : ({q}) => ({
        url : '/search/n/'+'?q='+q ,
        method : 'POST' ,
        credentials : 'include' ,
      }) ,
    }) ,
    continueSearch : builder.query({
      query : ({q , page , tab}) => ({
        url : '/search/continue/' +'?q='+q +'&page=' +page + '&tab=' + tab ,
        credentials : 'include'
      })
    }) ,

    //analytics
    getAnalyticsPage : builder.query({
      query : () => ({
        url : '/analytics/home' ,
        credentials : 'include'
      })
    }) ,

    //upload
    intializeVideoUpload : builder.mutation({
      query : ({fileSize , fileType}) => ({
        url : '/videoUpload/session' ,
        method : 'POST' ,
        body : {fileSize , fileType} ,
        credentials : 'include'
      })
    }) ,
    uploadVideoChunks : builder.mutation({
      query : ({form}) => ({
        url : '/videoUpload/chunk' ,
        method : 'POST' ,
        body : form ,
        credentials : 'include'
      })
    }) ,
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
  useUploadVideoChunksMutation ,
} = api ;