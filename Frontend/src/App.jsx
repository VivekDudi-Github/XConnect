import { lazy } from 'react';
import {Routes , Route, Navigate} from 'react-router-dom'

import ProtectedRoute from './component/specific/ProtectedRoute';

const Auth = lazy(() => import('./pages/Auth'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Profile = lazy(() => import('./pages/Profile'));


function App() {

  const user = 'user' ;
  return (
    <>
      <Routes>
        <Route path='/login' element={user ? <Navigate to={'/'}/> : <Auth/>} />

      <Route element={<ProtectedRoute user={user} /> } >
        <Route path='/' element={<HomePage/>} />
        <Route path='/profile' element={<Profile/>} />
      </Route>
      </Routes>
    </>
  )
}
export default App