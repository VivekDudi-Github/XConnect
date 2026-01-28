export function userApi(builder){
  return {
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
    toggleFollow : builder.mutation({
      query : ({id}) => ({
        url : `/user/${id}/follow` ,
        method : 'POST' ,
        credentials : 'include' ,
      })
    }) ,
  }
}
  
 