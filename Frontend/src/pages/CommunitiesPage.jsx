import Layout from '../layout/Layout'
import CommunityHome from '../component/community/communityHome'
import CommunityHomePage from '../component/community/CommunityHomePage'
import CommunityPostPage from '../component/community/CommunityPostPage'
import { Outlet } from 'react-router-dom'


function CommunitiesPage() {
  return (
    <Layout>
      <div className='dark:bg-black bg-transparent sm:pb-0 pb-8 w-full min-h-screen overflow-hidden relative'>
        <Outlet />
      </div>
    </Layout>
  )
}

export default CommunitiesPage