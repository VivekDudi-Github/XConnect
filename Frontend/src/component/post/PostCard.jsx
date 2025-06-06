export default function PostCard() {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <img
        src={`https://source.unsplash.com/random/300x200?sig=${Math.random()}`}
        alt="Post"
        className="w-full h-48 object-cover"
      />
      <div className="p-3 text-sm text-gray-200">
        A caption or description of the post goes here.
      </div>
    </div>
  );
}

