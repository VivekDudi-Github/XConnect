export function messagesApi(builder){
  return {
    getRooms : builder.query({
      query : () => ({
        url : '/room/get' ,
        credentials : 'include' ,
      }) ,
       providesTags : ['Room'] ,
    }) ,
    createRoom : builder.mutation({
      query : (data) => ({
        url : '/room/create' ,
        method : 'POST' ,
        body : data ,
        credentials : 'include' ,
      })
    }) ,
    getMessages: builder.query({
      query: ({ room, _id, limit }) => {
        const params = new URLSearchParams();

        if (room) params.append("room", room);
        if (_id) params.append("_id", _id);
        if (limit !== undefined) params.append("limit", String(limit));

        return {
          url: `/message/get?${params.toString()}`,
          credentials: "include",
        };
      },
      providesTags: (result, error, arg) => [
        { type: "Messages", id: `${arg.room}-${arg._id}` },
      ],
      keepUnusedDataFor: 60 * 60, // 1 hour
    }),
  }
}