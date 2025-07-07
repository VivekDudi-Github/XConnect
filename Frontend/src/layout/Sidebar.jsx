import { Bell, Settings, RocketIcon, SearchIcon, User2Icon, HomeIcon, LucideMessagesSquare, Users2, BookmarkIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSocket } from '../component/specific/socket';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

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
  const {unreadCount} = useSelector(state => state.notification) ;
  return (
    <nav className="p-4 space-y-3 dark:bg-black dark:text-gray-200 shadow-lg h-full shadow-black">
      {navItems.map(item => (
        <NavLink
          key={item.name}
          to={item.path}
          className="flex items-center relative gap-3 p-2 rounded-lg dark:hover:bg-gray-100  dark:hover:text-gray-700 dark:text-gray-300 hover:bg-gray-300 text-gray-700 duration-200"
        >
          <span className="text-lg" title={item.name}>{item.icon}</span>
          <span className="font-medium sm:w-0 md:w-auto overflow-hidden">{item.name}</span>
          {/* <div className='' > */}
            {item.name === 'Notifications' && unreadCount > 0 && (
              <span className="md:ml-auto md:size-6 md:static md:px-2 sm:absolute hidden top-1   sm:size-3  bg-red-500 text-white rounded-full duration-200  p-[0.45rem]  md:text-xs sm:text-[0.62rem] sm:flex items-center justify-center">
                {unreadCount}
              </span>
            )}
        </NavLink>
      ))}
    </nav>
  );
}
