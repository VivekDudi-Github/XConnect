import { NavLink } from 'react-router-dom';
import { Home, User, MessageCircle, Bell, SearchIcon, Rocket } from 'lucide-react';

const navItems = [
  { name: 'Home', icon: <Home size={22} />, path: '/' },
  {name : 'Xplore' , icon : <Rocket size={22}/>, path : '/explore'} ,
  { name: 'Messages', icon: <MessageCircle size={22} />, path: '/messages' },
  { name: 'Profile', icon: <User size={22} />, path: '/profile' },
  { name: 'Notifications', icon: <Bell size={22} />, path: '/notifications' },
  
];

export default function BottomNav() {
  return (
    <nav className="flex justify-around items-center dark:bg-black h-14 bg-white">
      {navItems.map(item => (
        <NavLink
          key={item.name}
          to={item.path}
          className="flex flex-col items-center dark:text-gray-300 text-gray-600 hover:text-purple-600"
        >
          {item.icon}
          <span className="text-xs">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}