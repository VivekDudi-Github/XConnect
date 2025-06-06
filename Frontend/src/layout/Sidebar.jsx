import { Bell, Settings, RocketIcon, SearchIcon, User2Icon, HomeIcon, LucideMessagesSquare, Users2, BookmarkIcon } from 'lucide-react';

const navItems = [
  { name: 'Home', icon: <HomeIcon />, path: '/' },
  { name: 'Profile', icon: <User2Icon />, path: '/profile' },
  { name: 'Search' , icon: <SearchIcon />, path: '/search' }, 
  { name: 'Explore', icon: <RocketIcon />, path: '/explore' },
  { name: 'Messages', icon: <LucideMessagesSquare />, path: '/messages' },
  { name: 'Groups', icon: <Users2 />, path: '/groups' }, 
  { name: 'Bookmarks', icon: <BookmarkIcon />, path: '/bookmarks' },
  { name: 'Notifications', icon: <Bell />, path: '/notifications' },
  { name: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function Sidebar() {
  return (
    <nav className="p-4 space-y-3">
      {navItems.map(item => (
        <a
          key={item.name}
          href={item.path}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="font-medium">{item.name}</span>
        </a>
      ))}
    </nav>
  );
}
