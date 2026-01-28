export function searchApi(builder){
  return {
    searchUsers: builder.query({
      query: ({ q, page }) => {
        const params = new URLSearchParams();

        if (q) params.append("q", q);
        if (page !== undefined) params.append("page", String(page));

        return {
          url: `/search/searchUsers/?${params.toString()}`,
          method: "GET",
          credentials: "include",
        };
      },
    }),

    searchBar: builder.mutation({
      query: ({ q }) => {
        const params = new URLSearchParams();

        if (q) params.append("q", q);

        return {
          url: `/search/searchbar/?${params.toString()}`,
          method: "POST",
          credentials: "include",
        };
      },
    }),

    normalSearch: builder.mutation({
      query: ({ q }) => {
        const params = new URLSearchParams();

        if (q) params.append("q", q);

        return {
          url: `/search/n/?${params.toString()}`,
          method: "POST",
          credentials: "include",
        };
      },
    }),

    continueSearch: builder.query({
      query: ({ q, page, tab }) => {
        const params = new URLSearchParams();

        if (q) params.append("q", q);
        if (page !== undefined) params.append("page", String(page));
        if (tab) params.append("tab", tab);

        return {
          url: `/search/continue/?${params.toString()}`,
          credentials: "include",
        };
      },
    }),

  }
}