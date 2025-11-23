import { Bell, Settings, RocketIcon, SearchIcon, User2Icon, HomeIcon, LucideMessagesSquare, Users2, BookmarkIcon, CameraOff, VideoIcon, Ellipsis, PlayIcon, PlaySquareIcon, IndianRupeeIcon, LayoutDashboardIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSocket } from '../component/specific/socket';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const navItems = [
  { name: 'Home', icon: <HomeIcon />, path: '/' },
  { name: 'Profile', icon: <User2Icon />, path: '/profile' },
  { name: 'Explore', icon: <RocketIcon />, path: '/explore' },
  { name: 'Messages', icon: <LucideMessagesSquare />, path: '/messages' },
  { name: 'Communities', icon: <Users2 />, path: '/communities' }, 
  { name: 'Bookmarks', icon: <BookmarkIcon />, path: '/bookmarks' },
  { name: 'Notifications', icon: <Bell />, path: '/notifications' },
  { name: 'Meet' , icon: <VideoIcon /> , path: '/meet' }, 
  { name: 'Go Live' , icon: <PlaySquareIcon /> , path: '/live' },   
  {name : 'Dashboard' , icon : <LayoutDashboardIcon /> , path : '/dashboard' },
  { name: 'Settings', icon: <Settings />, path: '/settings' },
];

  

export default function Sidebar({collapseFunc}) {
  const {unreadCount} = useSelector(state => state.notification) ;
  const [collapse , setCollapse] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapse(true);
        collapseFunc(true);
      } else {
        setCollapse(false);
        collapseFunc(false);
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  } , []);

  const handleResize = () => {
    setCollapse(!collapse) ;
    collapseFunc(!collapse);
  }
  return (
    <nav className={`p-4 dark:bg-black  dark:text-gray-200 shadow-lg h-full shadow-black flex flex-col justify-between duration-200 ${collapse ? "w-[72px]" : "w-56"}`}>  
      <span className='space-y-3 flex flex-col overflow-y-auto'>
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className="flex items-center relative gap-3 p-2 rounded-lg dark:hover:bg-gray-100  dark:hover:text-gray-700 dark:text-gray-300 hover:bg-gray-300 text-gray-700 duration-200"
          >
            <span className="text-lg" title={item.name}>{item.icon}</span>
            <span className={`font-medium text-nowrap overflow-hidden ${collapse ? "w-0" : "w-full"} `}>{item.name}</span> 
            {/* <div className='' > */}
              {item.name === 'Notifications' && unreadCount > 0 && (
                <span className="md:ml-auto md:size-6 md:static md:px-2 sm:absolute hidden top-1   sm:size-3  bg-red-500 text-white rounded-full duration-200  p-[0.45rem]  md:text-xs sm:text-[0.62rem] sm:flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
          </NavLink>
        ))}
      </span>
      <span  onClick={() => handleResize()} className='flex items-center justify-center gap-2 p-2 rounded-lg dark:hover:bg-gray-100  dark:hover:text-gray-700 dark:text-gray-300 hover:bg-gray-300 text-gray-700 duration-200'>
        <Ellipsis className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 duration-200 cursor-pointer" />
      </span>
    </nav>
  );
}
