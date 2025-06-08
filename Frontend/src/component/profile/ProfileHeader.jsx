import { SettingsIcon } from 'lucide-react';
import React from 'react'
import { NavLink } from 'react-router-dom';

function ProfileHeader() {
  const user = 'user' ;
    return (
      <>
        <div className='relative w-full'>
          <img className='w-full h-40 bg-gradient-to-b from-gray-300 to-gray-500 -z-20 ' 
            src="https://via.placeholder.com/1200x400" 
            alt="banner" />
          <div className='bg-gradient-to-b to-gray-800 via-transparent from-transparent absolute w-full h-full z-10 top-0'/>
        </div>
        <div className="flex flex-col relative items-center px-3 pt-2 gap-3 dark:bg-black sm:flex-row sm:items-start sm:gap-6">
          
          <div>
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              className="w-28 h-28 mx-auto rounded-full object-cover border-2 border-gray-300"
            />
          <h2 className="text-base text-center block p-2 dark:text-slate-400 text-cyan-600">@glucose999calories&fit</h2>
          </div>
          <div className='pt-2  sm:w-auto  w-full'>
            <h2 className="text-3xl font-semibold dark:text-gray-200" >Abc</h2>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm">Web Developer • 🇮🇳 India</p>
            <p className="mt-2 text-gray-700 dark:hover:text-gray-200 dark:text-gray-500">Building the next-gen social app 🚀</p>
            <div className="flex gap-6 mt-4 text-sm text-gray-700 dark:text-gray-500">
              <span><strong className='dark:text-gray-300'>132</strong> Posts</span>
              <span><strong className='dark:text-gray-300'>1.2k</strong> Followers</span>
              <span><strong className='dark:text-gray-300'>450</strong> Following</span>
            </div>
            {user && (
            <button className="hidden sm:block mt-4 px-4 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700">
              Edit Profile
            </button>
            )}
          </div>

          {user && (
          <button className=' absolute sm:hidden block  right-2 p-2 text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'>
            <SettingsIcon/>
          </button>
          )}
        </div>
      </>
    );
  }
  



export default ProfileHeader