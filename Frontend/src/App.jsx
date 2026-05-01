import { lazy, Suspense } from 'react';
import './App.css'

import {Routes , Route, Navigate, useNavigate} from 'react-router-dom'

import {useProgress} from '@bprogress/react'
import { ToastContainer , Slide } from 'react-toastify';
import ProtectedRoute from './component/specific/ProtectedRoute';
import { useLazyFetchMeQuery } from './redux/api/api';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './component/ui/Loader';
import { login, logout } from './redux/reducer/authSlice';



const LandingPage = lazy(() => import('./pages/LandingPage'));
const PostPage = lazy(() => import('./pages/PostPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LivePage = lazy(() => import('./pages/LivePage'));
const MeetPage = lazy(() => import('./pages/MeetPage'));

const Profile = lazy(() => import('./pages/ProfilePage'));
const CommentPage = lazy(() => import('./pages/CommentPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage')) ;
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));

const DashboardMain = lazy(() => import('./component/dashboard/DashboardMain'));
const DashboardPage = lazy(() => import('./pages/DashboradPage'));

const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage'));
const CommunityHome = lazy(() => import('./component/community/communityFeedPage'));
const CommunityHomePage = lazy(() => import('./component/community/CommunityHomePage'))
const CommunityPostPage = lazy(() => import('./component/community/CommunityPostPage'))


const loading = (
  <div className='min-h-screen w-screen dark:bg-black bg-white flex items-center justify-center'>
    <Loader message={'Loading..'} />
  </div>
)

function App() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const {user , isAuthLoading} = useSelector(state => state.auth)
  const [fetchMe ,{data, isError, isSuccess}] = useLazyFetchMeQuery()
  
useEffect(() => {
  if(isError){
    dispatch(logout())
  }
  if(isSuccess){
    if(!data) navigate('/login') ;
    else {
      dispatch(login(data.data)) ;
    }
  }
} , [isError , isSuccess , data])

useEffect(() => {
  fetchMe() ;
}, [])


  if(isAuthLoading ) return loading ;


  return (
    <>
      <Suspense fallback={<SuspenseBar children={loading} />}>
        <Routes>
          <Route path='/login' element={!user ?  <LandingPage/> : <Navigate to={'/'} /> } />

          <Route element={<ProtectedRoute user={user} /> } >
            <Route path='/' element={LazyWrapper({children :<HomePage/>})} />
            <Route path='/profile/:username' element={<LazyWrapper children={<Profile/>}/> } />
            <Route path='/explore/' element={<LazyWrapper children={<ExplorePage/>} />} />
            <Route path='/post/:id' element={<LazyWrapper children={<PostPage/>} />} />
            <Route path='/profile' element={LazyWrapper({ children:<Profile/>})} /> 
            <Route path='/notifications' element={<LazyWrapper children={<NotificationPage/>} />} />
            
            <Route path='/communities' element={<LazyWrapper children={<CommunitiesPage/>} />}>
              <Route path='' element={<LazyWrapper children={<CommunityHome />} />} />
              <Route path='post/:id' element={<LazyWrapper children={<CommunityPostPage />} />} />
              <Route path='c/:id' element={<LazyWrapper children={<CommunityHomePage />} />} />
            </Route>

            {/* <Route path='/settings' element={<SettingsPage/>} /> */}
            <Route path="/messages" element={<LazyWrapper children={<MessagesPage />} />}>
              <Route path="chat" element={<LazyWrapper children={<MessagesPage />} />} />
              <Route path="chat/:username" element={<LazyWrapper children={<MessagesPage />} />} />
            </Route>

            <Route path='/dashboard' element={<LazyWrapper children={<DashboardPage />} />} >
              <Route path='' element={<LazyWrapper children={<DashboardMain />} />} />
            </Route> 

            <Route path='/live' element={<LazyWrapper children={<LivePage />} />} />
            <Route path='/live/watch/:id' element={<LazyWrapper children={<LivePage />} />} />
            <Route path='/meet' element={<LazyWrapper children={<MeetPage/>} />} />
            <Route path='/comment/:id' element ={<LazyWrapper children={<CommentPage />} />} />
            <Route path='/about' element={<LazyWrapper children={<LandingPage/>} />} />
          </Route>
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          closeButton={false}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme={isDarkMode ? 'dark' : 'light'}
          transition={Slide}
          pauseOnHover 
          />
      </Suspense>
    </>
  )
}
export default App

function LazyWrapper ({children}){
  return (
    <Suspense fallback={<SuspenseBar/>}>
      {children}
    </Suspense>
  )
}


function SuspenseBar({children}) {
  const {start , stop} = useProgress() ;
  useEffect(() => {
    start() ;
    return () => stop() ;
  })
  return (
    <>
      <div className='min-h-screen w-screen dark:bg-black/60 bg-white/60 flex items-center justify-center'>
        {children || loading}
      </div>
    </>
  )
}