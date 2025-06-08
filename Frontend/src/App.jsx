import { lazy } from 'react';
import {Routes , Route, Navigate, useNavigate} from 'react-router-dom'

import ProtectedRoute from './component/specific/ProtectedRoute';
import { useLazyFetchMeQuery } from './redux/api/api';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './component/shared/Loader';
import { login, logout } from './redux/reducer/authSlice';

const Auth = lazy(() => import('./pages/Auth'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Profile = lazy(() => import('./pages/Profile'));




function App() {
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
      <Routes>
        <Route path='/login' element={!user ?  <Auth/> : <Navigate to={'/'} /> } />

        <Route element={<ProtectedRoute user={user} /> } >
          <Route path='/' element={<HomePage/>} />
          <Route path='/profile' element={<Profile/>} />
        </Route>
      </Routes>
    </>
  )
}
export default App