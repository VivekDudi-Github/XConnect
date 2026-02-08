export function liveApi(builder){
  return {
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
        return {
        url : `/live/${id}` ,
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
  }
}