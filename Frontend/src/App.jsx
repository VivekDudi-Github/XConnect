import { lazy, Suspense } from 'react';
import {Routes , Route, Navigate, useNavigate} from 'react-router-dom'

import { ToastContainer , Slide } from 'react-toastify';
import ProtectedRoute from './component/specific/ProtectedRoute';
import { useLazyFetchMeQuery } from './redux/api/api';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './component/shared/Loader';
import { login, logout } from './redux/reducer/authSlice';
import CommentPage from './pages/CommentPage';


const Auth = lazy(() => import('./pages/Auth'));
const PostPage = lazy(() => import('./pages/PostPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Profile = lazy(() => import('./pages/ProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage')) ;
// const MessagingPage = lazy(() => import('./pages/MessagingPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));


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


  if(isAuthLoading ) return (
    <div className='h-screen w-screen dark:bg-black bg-white'>
      <Loader message={'Loading..'} />
    </div>
  )
  
  return (
    <>
      <Suspense fallback={<Loader message={'Loading..'} />}>
        <Routes>
          <Route path='/login' element={!user ?  <Auth/> : <Navigate to={'/'} /> } />

          <Route element={<ProtectedRoute user={user} /> } >
            <Route path='/' element={<HomePage/>} />
            <Route path='/profile/:username' element={<Profile/>} />
            <Route path='/explore/' element={<ExplorePage/>} />
            <Route path='/post/:id' element={<PostPage/>} />
            <Route path='/profile' element={<Profile/>} />
            <Route path='/notifications' element={<NotificationPage/>} />
            
            {/* <Route path='/settings' element={<SettingsPage/>} /> */}
            <Route path='/messages' element={<MessagesPage />} />
            <Route path='/messages/chat/:username' element={<MessagesPage />} />

            <Route path='/comment/:id' element ={<CommentPage />} />
            
          </Route>
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