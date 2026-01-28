export function commentApi(builder){
  return {
    postComment : builder.mutation({
      query : ({postId , ...data}) => ({
        url : `/comment/${postId}` ,
        method : 'POST' ,
        body : data ,
        credentials : 'include' ,
      })
    }) ,
    getComment : builder.query({
      query : ({id , page , sortBy , isComment , limit = 5 , comment_id }) => {
        
        let params = new URLSearchParams() ;
        if (page !== undefined) params.append("page", page);
        if (sortBy) params.append("sortBy", sortBy);
        if (isComment !== undefined) params.append("isComment", String(isComment));
        if (comment_id) params.append("comment_id", comment_id);
        params.append("limit", String(limit));
        return {
         url: `/comment/post/${id}?${params.toString()}`,
        credentials : 'include' ,
      }} 
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
  }
}