import * as repo from './search.db.js';

export const autocompleteSearch = async (q) => {
  const [users, communities] = await Promise.all([
    repo.searchUsersAutocomplete(q),
    repo.searchCommunitiesAutocomplete(q)
  ]);

  return { users, communities };
};

export const normalSearch = async ({ q, userId }) => {
  const limit = 5;
  const skip = 0 ; 

  const [users, posts, communities] = await Promise.all([
    repo.searchUsers(q, skip, limit, userId),
    repo.searchPosts(q, skip, limit, userId),
    repo.searchCommunities(q, skip, limit, userId)
  ]);

  let [totalUsers , totalPosts , totalCommunities] = await Promise.all([
    repo.searchUsersAggregates(q) ,
    repo.searchPostsAggregates(q) ,
    repo.searchCommunitiesAggregates(q)  ,
  ]);

  totalCommunities = Math.ceil(totalCommunities[0].count.lowerBound / limit) ;
  totalPosts = Math.ceil(totalPosts[0].count.lowerBound / limit) ;
  totalUsers = Math.ceil(totalUsers[0].count.lowerBound / limit) ;

  console.log(totalCommunities , totalPosts , totalUsers) ;

  return {
    user: { results: users , total : totalUsers } ,
    post: { results: posts , total : totalPosts } ,
    community: { results: communities  , total : totalCommunities }
  };
};

export const continueSearch = async ({ q, tab, page, userId }) => {
  const limit = 5;
  const skip = (page - 1) * limit;
  console.log(q, tab, page);
  

  switch (tab) {
    case 'post':
      return repo.searchPosts(q, skip, limit, userId);
    case 'user':
      return repo.searchUsers(q, skip, limit, userId);
    case 'community':
      return repo.searchCommunities(q, skip, limit, userId);
  }
};

export const searchUsers = async ({ q, page, userId }) => {
  const limit = 5;
  const skip = (page - 1) * limit;

  const [users] = await Promise.all([
    repo.searchUsers(q, skip, limit, userId),
  ]);

  return {
    results: users , 
    page ,
  };
};