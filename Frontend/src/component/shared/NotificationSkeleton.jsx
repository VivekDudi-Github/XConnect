export default function NotificationSkeleton({ count = 3 }) {
  return (
    <ul className="space-y-3 animate-pulse">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <li key={i} className="h-6 bg-gray-200 rounded w-3/4" />
        ))}
    </ul>
  );
}
