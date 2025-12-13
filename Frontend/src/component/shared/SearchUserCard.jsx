import { UserRoundCheck, UserPlus } from "lucide-react";

function SearchUserCard({
  username,
  fullname,
  avatar,
  bio ,
  isFollowing,
  totalFollowers,
  onToggleFollow,
}) {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition flex flex-col gap-2 w-full min-w-[200px] max-w-sm custom-box">
      
      {/* Top Section */}
      <div className="flex gap-4 items-start">
        <img
          src={avatar.url || './avatar-default.svg'}
          alt={username}
          className="w-14 h-14 rounded-full object-cover border"
        />

        <div className="flex flex-col flex-1 min-w-0" title={'@' +username}>
          <span className="text-base font-semibold truncate">{fullname}</span>
          <span className="text-sm text-cyan-600 font-semibold truncate">@{username}</span>
          <span className="text-xs ">{totalFollowers} followers</span>
          {bio && <p className="text-sm text-gray-400 mt-1 truncate">{bio}</p>}
        </div>
      </div>

      {/* Bottom Section — Follow Button */}
      <button
        onClick={onToggleFollow}
        className={`flex items-center justify-center gap-2 w-full py-2 text-sm rounded-lg border transition
          ${
            isFollowing
              ? "border-gray-300 bg-gray-100 text-black hover:bg-gray-200"
              : "border-white text-white bg-cyan-400 dark:bg-transparent hover:bg-blue-50 hover:text-black"
          }`}
      >
        {isFollowing ? (
          <>
            <UserRoundCheck className="w-4 h-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Follow
          </>
        )}
      </button>
    </div>
  );
}

function SearchUserCardSkeleton() {
  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition flex flex-col gap-2 w-full max-w-sm custom-box">
      <div className="flex gap-4 items-start animate-pulse duration-200">
        <img src="./avatar-default.svg" className="w-14 h-14 rounded-full border" />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="h-2 w-full bg-gray-800/50 dark:bg-slate-400/50 rounded-md mt-1"></div>
          <div className="h-2 w-full bg-gray-800/50 dark:bg-slate-400/50 rounded-md mt-1"></div> 
        </div>
      </div>

      {/* Bottom Section — Follow Button */}
      <div className="flex items-center justify-center gap-2 w-full py-2 text-sm rounded-lg border border-black/50 dark:border-white/30 transition animate-pulse duration-200">
        <div className="h-4 w-4 rounded-full bg-gray-800 dark:bg-slate-400"></div>
        <div className="h-4 w-4 rounded-full bg-gray-800 mt-1 dark:bg-slate-400 "></div>
      </div>
    </div>
  );
}

export { SearchUserCard, SearchUserCardSkeleton };
