export function postApi(builder){
  return { 
    getPost: builder.query({
      query : (id) => ({
        url : `/post/${id}` ,
        credentials : 'include' ,
      }) ,
    }) ,
    createPost : builder.mutation({
      query : (data , username) => ({
        url : '/post' ,
        method : 'POST' ,
        body : data ,
        credentials : 'include' ,
      } 
    ) , 
      invalidateTags : (result , error , arg) => [
        { type: "UserPosts" , id : `posts-Posts-${arg.username}` } ,
      ] ,
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
    
    getUserPosts: builder.query({
      query: ({ page, username, tab }) => {
        const params = new URLSearchParams(); console.log('get user post' , username , tab);
        
        if (page !== undefined) params.append("page", String(page));
        if (tab) params.append("tab", tab);
        if (username) params.append("username", username);

        return {
          url: `/post/user/?${params.toString()}`,
          credentials: "include",
        };
      },
      providesTags : (result , error , arg) => [
        { type: "UserPosts", id: `posts-${arg.tab}-${arg.username}` }, 
      ] ,
      keepUnusedDataFor: 60 * 5, // 5 minutes
    }),
    toggleOnPost : builder.mutation({
      query : ({id , option}) => {
        return ({
        url : `/post/toggle/${id}` ,
        method : 'POST' ,
        body : {option : option} ,
        credentials : 'include'   
      })}
    }) ,
    
    getFeedPosts: builder.query({
      query: ({ tab, page }) => {
        const params = new URLSearchParams();

        if (tab) params.append("tab", tab);
        if (page !== undefined) params.append("page", String(page));

        return {
          url: `/post/me/feed/?${params.toString()}`,
          credentials: "include",
        };
      },
    }),

    getTrending: builder.query({
      query: ({ tab, page }) => {
        const params = new URLSearchParams();
        if (tab) params.append("tab", tab);
        if (page !== undefined) params.append("page", String(page));

        return {
          url: `/post/trending/?${params.toString()}`,
          credentials: "include",
        };
      },
      providesTags: (result, error, arg) => [
        { type: "Post", id: `TRENDING-${arg.tab}-${arg.page}` },
      ],
      keepUnusedDataFor: 60 * 5, // 5 minutes
    }),

    increasePostViews : builder.mutation({
      query : ({id}) => ({
        url : `/post/increaseViews/${id}` ,
        method : 'POST' ,
        credentials : 'include' ,
      })
    }) ,
  }
}
