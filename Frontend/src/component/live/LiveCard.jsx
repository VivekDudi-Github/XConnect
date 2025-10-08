import { Link } from "react-router-dom";

export default function LiveCard({ stream }) {
  return (
    <Link to={`/live/${stream.id}`}>
      <div className="rounded-2xl shadow hover:shadow-lg transition overflow-hidden dark:text-white text-black">
        <img src={stream.thumbnail} alt={stream.title} className="w-full h-48 object-cover" />
        <div className="p-3">
          <h2 className="font-semibold">{stream.title}</h2>
          <p className="text-sm text-gray-500">{stream.host}</p>
          <p className="text-xs text-red-600 font-medium">{stream.viewers} watching</p>
        </div>
      </div>
    </Link>
  );
}
