export function videoApi(builder){
  return {
    getVideoPoster : builder.query({
      query : ({public_id}) => ({
        url : `/video/poster/${public_id}` ,
        credentials : 'include'
      })
    }) ,
    intializeVideoUpload : builder.mutation({
      query : ({fileSize , fileType}) => ({
        url : '/video/session' ,
        method : 'POST' ,
        body : {fileSize , fileType} ,
        credentials : 'include'
      })
    }) ,
    uploadStatusCheck : builder.query({
      query : ({public_id}) => ({
        url : `/video/status/${public_id}` ,
        credentials : 'include'
      })
    }) ,
    uploadVideoChunks : builder.mutation({
      query : ({form}) => ({
        url : '/video/chunk' ,
        method : 'POST' ,
        body : form ,
        credentials : 'include'
      })
    }) ,
    verifyUploadVideo : builder.mutation({
      query : ({public_id}) => ({
        url : '/video/verify/'+public_id ,
        method : 'POST' ,
        credentials : 'include'
      })
    }) ,
  }
}
