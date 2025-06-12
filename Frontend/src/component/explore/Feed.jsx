import React from 'react'
import PostCard from '../post/PostCard'

import { dummyPosts } from '../../sampleData'

function Feed() {
  return (
    <div className="max-w-3xl mx-auto mt-4 px-2 sm:px-0">
      <h1 className="text-2xl font-semibold mb-4">Your Feed</h1>

      {dummyPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default Feed