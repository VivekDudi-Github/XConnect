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
    })
  })
})
export default api ;

export const {
  useLazyFetchMeQuery ,
  useRegisterMeMutation
} = api ;