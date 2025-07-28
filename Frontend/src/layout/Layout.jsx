import React , {useEffect, useMemo, useRef} from 'react'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'

function Layout({children}) {

  return (
    <>
      <div className="flex overflow-y-auto dark:bg-black bg-white">
      {/* Sidebar (hidden on small screens) */}
      <div className="fixed md:w-56 sm:w-[72px] sm:translate-x-0 w-0 -translate-x-12 bg-white dark:bg-black md:border-r-2 border-r-0 border-x-gray-400 shadow-sm left-0 top-0 duration-200 h-screen ">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className=" text-black md:ml-60 sm:ml-[76px]  h-auto overflow-y-auto w-full duration-200">
        {children}
      </main>

      {/* Bottom nav (only visible on small screens) */}
      <div className=" fixed sm:translate-y-full translate-y-0 bottom-0 left-0 w-full bg-white dark:border-gray-700 border-t shadow-md z-50 duration-200">
        <BottomBar />
      </div>
    </div>
    </>
  )
}

export default Layout