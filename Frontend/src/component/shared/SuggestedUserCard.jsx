export function SuggestedUserCard({ user }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={user.avatar} className="w-9 h-9 rounded-full" />
        <div>
          <p className="font-semibold">{user.username}</p>
          <p className="text-sm text-gray-400">@{user.handle}</p>
        </div>
      </div>
      <button className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">Follow</button>
    </div>
  );
}
