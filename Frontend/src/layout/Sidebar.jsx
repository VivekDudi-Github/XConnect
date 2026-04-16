import { Bell, Settings, RocketIcon, User2Icon, HomeIcon, LucideMessagesSquare, Users2,  VideoIcon, Ellipsis, PlaySquareIcon, LayoutDashboardIcon, ChevronsRightIcon, PowerCircle } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLogoutMutation } from '../redux/api/api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import {logout} from '../redux/reducer/authSlice' ;

const navItems = [
  { name: 'Home', icon: <HomeIcon />, path: '/' },
  { name: 'Profile', icon: <User2Icon />, path: '/profile' },
  { name: 'Explore', icon: <RocketIcon />, path: '/explore' },
  { name: 'Messages', icon: <LucideMessagesSquare />, path: '/messages' },
  { name: 'Communities', icon: <Users2 />, path: '/communities' }, 
  { name: 'Notifications', icon: <Bell />, path: '/notifications' },
  { name: 'Meet' , icon: <VideoIcon /> , path: '/meet' }, 
  { name: 'Go Live' , icon: <PlaySquareIcon /> , path: '/live' },   
  { name : 'Dashboard' , icon : <LayoutDashboardIcon /> , path : '/dashboard' },
  { name: 'LogOut', icon: <PowerCircle />, path: '/login' },
];

  

export default function Sidebar({collapseFunc}) {
  const navigate = useNavigate() ;
  const dispatch = useDispatch() ;

  const {unreadCount} = useSelector(state => state.notification) ;
  const [collapse , setCollapse] = useState(false);
  const [hidden , setHide] = useState(true) ;

  const [logoutMutation] = useLogoutMutation() ;
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapse(true);
        collapseFunc(true);
        setHide(false) ;
      } else {
        setCollapse(false);
        collapseFunc(false);
        setHide(false) ;
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
  const hide = () => {
    if(hidden){
      setCollapse(true) ;
      setHide(!hidden) ;
    }else {
      setCollapse(true) ;
      setHide(!hidden) ;
    }
  }

  const logoutFn = async() => {
    try {
      await logoutMutation() ;
      dispatch(logout()) ;
      navigate('/login')
    } catch (error) {
      console.log('logout api error :' , error);
      toast.error(error.data?.message || 'There was some error in loggin out') ;
    }
  }
  return (
    <nav className={`p-4 sm:pb-4 pb-16 dark:bg-black bg-white dark:text-gray-200 shadow-lg h-full shadow-black flex flex-col justify-between duration-200 ${collapse ? "w-[72px]" : "w-56"} ${!hidden ? '' : 'sm:translate-0 -translate-x-[76px] shadow-sm'} `}>  
      <span className='space-y-3 flex flex-col overflow-y-auto'>
        {navItems.map(item => {
          if(item.name === 'LogOut') {
            return (
              <div
                onClick={logoutFn}
                key={item.name}
                className="flex items-center relative gap-3 p-2 rounded-lg dark:hover:bg-gray-100  dark:hover:text-gray-700 dark:text-gray-300 hover:bg-gray-300 text-gray-700 duration-200"
              >
                <span className="text-lg" title={item.name}>{item.icon}</span>
                <span className={`font-medium text-nowrap overflow-hidden ${collapse ? "w-0" : "w-full"} `}>{item.name}</span> 
              </div>  
            )
          } ;
          return (
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
          )})}
      </span>
      <span  onClick={() => handleResize()} className='flex items-center justify-center gap-2 p-2 rounded-lg dark:hover:bg-gray-100  dark:hover:text-gray-700 dark:text-gray-300 hover:bg-gray-300 text-gray-700 duration-200'>
        <Ellipsis className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 duration-200 cursor-pointer" />
      </span>
      <span  onClick={() => hide()} 
      className={`flex sm:hidden bottom-16 fixed items-center justify-center gap-2 p-2 rounded-full dark:bg-black bg-white dark:hover:bg-gray-100  dark:hover:text-gray-700 dark:text-gray-300 hover:bg-gray-300 text-gray-700 duration-200 ${!hidden ? 'rotate-180' : "" } ${collapse ? "left-14" : "left-52"} shadow-sm shadow-black/50 duration-200`}> 
        <ChevronsRightIcon className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 duration-200 cursor-pointer" />
      </span>
    </nav>
  );
}

