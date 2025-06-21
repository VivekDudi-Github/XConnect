import {createApi , fetchBaseQuery} from '@reduxjs/toolkit/query/react'

const api = createApi({
  reducerPath : 'api' ,
  baseQuery : fetchBaseQuery({baseUrl : 'http://localhost:3000/api/v1'}),
  tagTypes : ['Group' , 'Messages' , 'User' , 'Post' , ] ,

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

//posts
    getPost: builder.query({
      query : (id) => ({
        url : `/post/:${id}` ,
        credentials : 'include' ,
      })
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
      query : ({page , tab}) => ({
        url : `/post/me/posts/?page=${page}&tab${tab}` ,
        credentials : 'include' ,
      })
    }) ,
    toggleOnPost : builder.mutation({
      query : ({id , option}) => {
        console.log(option , id)
        return ({
        url : `/post/toggle/${id}` ,
        method : 'POST' ,
        body : {option : option} ,
        credentials : 'include'   
      })}
    }) ,
    
    getFeedPosts : builder.query({
      query : () => ({
        url : '/post/feed' ,
        credentials : 'include' ,
      })
    })
  })
})
export default api ;

export const {
// profile-user
  useLazyFetchMeQuery ,
  useRegisterMeMutation ,
  useLoginMeMutation ,
  useUpdateProfileMutation ,

//post
  useCreatePostMutation ,
  useEditPostMutation ,
  useDeletePostMutation ,
  useLazyGetPostQuery ,

  useLazyGetUserPostsQuery,
  useToggleOnPostMutation ,
  
} = api ;