import React , {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'

function Layout({children}) {
  const [collapse , setCollapse] = useState(false);

  const handleResize = (value) => {
      setCollapse(value);
  }
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapse(true);
      } else {
        setCollapse(false);
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  } , []);
  return (
    <>
      <div className="flex overflow-y-auto dark:bg-black bg-white">
      {/* Sidebar (hidden on small screens) */}
      <div className="fixed sm:translate-x-0 w-0 z-20  bg-white dark:bg-black md:border-r-2 border-r-0 border-x-gray-400 shadow-sm left-0 top-0 duration-200 h-screen ">
        <Sidebar collapseFunc={handleResize} />
      </div>

      {/* Main content */}
      <main className={` text-black ${collapse ? "sm:ml-[76px] ml-0 " : "md:ml-60 sm:ml-60"}  h-auto overflow-y-auto w-full duration-200`}>
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