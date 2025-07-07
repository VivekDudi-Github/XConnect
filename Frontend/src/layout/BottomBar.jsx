import { NavLink } from 'react-router-dom';
import { Home, User, MessageCircle, Bell, SearchIcon, Rocket } from 'lucide-react';
import { useSelector } from 'react-redux';

const navItems = [
  { name: 'Home', icon: <Home size={22} />, path: '/' },
  {name : 'Xplore' , icon : <Rocket size={22}/>, path : '/explore'} ,
  { name: 'Messages', icon: <MessageCircle size={22} />, path: '/messages' },
  { name: 'Profile', icon: <User size={22} />, path: '/profile' },
  { name: 'Notifications', icon: <Bell size={22} />, path: '/notifications' },
  
];

export default function BottomNav() {
  const {unreadCount} = useSelector(state => state.notification)

  return (
    <nav className="flex justify-around items-center dark:bg-black h-14 bg-white">
      {navItems.map(item => (
        <NavLink
          key={item.name}
          to={item.path}
          className="flex flex-col items-center relative dark:text-gray-300 text-slate-600 hover:text-purple-600"
        >
          {item.icon}
          <span className="text-xs">{item.name}</span>
          {item.name === 'Notifications' && unreadCount > 0 && (
              <span className=" absolute  -top-1 right-5   size-3  bg-red-500 text-white rounded-full duration-200  p-2 text-xs flex items-center justify-center"> 
                {unreadCount}
              </span>
            )}
        </NavLink>
      ))}
    </nav>
  );
}