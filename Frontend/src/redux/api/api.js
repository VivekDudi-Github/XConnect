import {createApi , fetchBaseQuery} from '@reduxjs/toolkit/query/react'

const api = createApi({
  reducerPath : 'api' ,
  baseQuery : fetchBaseQuery({baseUrl : 'http://localhost:3000/api/v1'}),
  tagTypes : ['Group' , 'Messages' , 'User' , 'Post' , ] ,

  endpoints : (builder) => ({
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
        credentials : 'include'
      }) 
    }) 
  })
})
export default api ;

export const {
  useLazyFetchMeQuery ,
  useRegisterMeMutation ,
  useLoginMeMutation ,
  useUpdateProfileMutation
} = api ;