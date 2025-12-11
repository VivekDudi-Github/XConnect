import { UsersRound, UserRoundCheck, UserPlus } from "lucide-react";

function SearchCommunityCard({
  name,
  avatar,
  banner,
  description ,
  isFollowing,
  totalFollowers,
  onToggleFollow,
}) {
  return (
    <div className="border rounded-xl bg-white h-[175px] min-w-[280px] shadow-sm hover:shadow-md transition flex flex-col  overflow-hidden custom-box">
      
      {/* Banner */}
      <div className="relative w-full h-16 ">
        <img
          src={banner.url || ''}
          className="w-full h-full object-cover bg-gradient-to-r from-blue-500 to-purple-500"
        />
        <div className="h-full w-full bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-black/80  absolute top-0 left-0 right-0 bottom-0"></div>
      </div>

      {/* Avatar overlapping banner */}
      <div className="px-4 -mt-8 flex items-center gap-4">
        <img
          src={avatar.url || '/avatar-default.svg'}
          alt={`${name} avatar`}
          className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover z-50"
        />

        <div className="flex flex-col z-50 ">
          <span className="text-base font-semibold truncate">{name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-1 font-bold">
            <UsersRound className="w-3 h-3" />
            {totalFollowers} followers
          </span>
          <span className="text-xs font-semibold text-ellipsis text-gray-600">{description.length > 50 ? description.slice(0,50)+"..." : description }</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 ">
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
    </div>
  );
}


export {SearchCommunityCard}