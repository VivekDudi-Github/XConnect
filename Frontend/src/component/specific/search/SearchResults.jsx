import PostCard from "../../post/PostCard"; 
import { SuggestedUserCard } from "../../shared/SuggestedUserCard";

export default function SearchResults({ results }) {
  const { posts = [], users = [], hashtags = [], communities = [] } = results;

  return (
    <div className="space-y-6">
      {posts.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Posts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {posts.map(post => (
              <ExplorePostCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Users</h2>
          <div className="space-y-3">
            {users.map(user => (
              <SuggestedUserCard key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}

      {hashtags.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Trending Hashtags</h2>
          <div className="flex gap-2 flex-wrap">
            {hashtags.map(tag => (
              <a
                key={tag}
                href={`/explore/tags/${tag}`}
                className="px-3 py-1 bg-gray-100 text-sm rounded-full text-blue-600 hover:bg-blue-100"
              >
                #{tag}
              </a>
            ))}
          </div>
        </div>
      )}

      {communities.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Communities</h2>
          {communities.map(community => (
            <div key={community._id} className="text-gray-700">
              <a href={`/community/${community.slug}`} className="text-blue-600 hover:underline">
                {community.name}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
