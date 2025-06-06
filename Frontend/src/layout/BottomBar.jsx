import { Home, User, MessageCircle, Bell } from 'lucide-react';

const navItems = [
  { name: 'Home', icon: <Home size={22} />, path: '/' },
  { name: 'Messages', icon: <MessageCircle size={22} />, path: '/messages' },
  { name: 'Profile', icon: <User size={22} />, path: '/profile' },
  { name: 'Notifications', icon: <Bell size={22} />, path: '/notifications' },
];

export default function BottomNav() {
  return (
    <nav className="flex justify-around items-center h-14 bg-white">
      {navItems.map(item => (
        <a
          key={item.name}
          href={item.path}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          {item.icon}
          <span className="text-xs">{item.name}</span>
        </a>
      ))}
    </nav>
  );
}