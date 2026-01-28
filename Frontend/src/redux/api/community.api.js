export function communityApi(builder){
  return {
    createCommunity : builder.mutation({
      query : (data) => ({
        url : '/community/create',
        method : 'POST' ,
        body : data ,
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


    getCommunityFeed: builder.query({
      query: ({ page, limit = 2 }) => {
        const params = new URLSearchParams();

        if (page !== undefined) params.append("page", String(page));
        if (limit !== undefined) params.append("limit", String(limit));

        return {
          url: `/community/feed/?${params.toString()}`,
          credentials: "include",
        };
      },
    }),

    getCommunityPosts: builder.query({
      query: ({ id, page = 1, limit = 1 }) => {
        const params = new URLSearchParams();

        if (page !== undefined) params.append("page", String(page));
        if (limit !== undefined) params.append("limit", String(limit));

        return {
          url: `/community/posts/${id}?${params.toString()}`,
          method: "GET",
          credentials: "include",
        };
      },
    }),

  }
}