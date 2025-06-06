import React from 'react'
import Sidebar from './Sidebar'
import BottomBar from './BottomBar'

function Layout({childern}) {
  return (
    <>
      <div className="flex h-screen">
      {/* Sidebar (hidden on small screens) */}
      <div className="hidden md:block w-56 bg-white border-r shadow-sm">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1  overflow-y-auto p-4 pb-20 md:pb-4">
        abc
        {childern}
      </main>

      {/* Bottom nav (only visible on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-md z-50">
        <BottomBar />
      </div>
    </div>
    </>
  )
}

export default Layout