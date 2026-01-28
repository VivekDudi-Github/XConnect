export function videoUploadApi(builder){
  return {
    intializeVideoUpload : builder.mutation({
      query : ({fileSize , fileType}) => ({
        url : '/videoUpload/session' ,
        method : 'POST' ,
        body : {fileSize , fileType} ,
        credentials : 'include'
      })
    }) ,
    uploadStatusCheck : builder.query({
      query : ({public_id}) => ({
        url : `/videoUpload/status/${public_id}` ,
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
    verifyUploadVideo : builder.mutation({
      query : ({public_id}) => ({
        url : '/videoUpload/verify/'+public_id ,
        method : 'POST' ,
        credentials : 'include'
      })
    }) ,
  }
}
