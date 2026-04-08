import { useState } from 'react';
import LoginForm from '../component/landing/LoginForm';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AboutTab from '../component/landing/AboutTab';
import ArchitectureTab from '../component/landing/ArchitectureTab';

const Tab = ['XConnect' ,'API', 'Architecture' , 'GitHub' , 'About']

export default function LandingPage() {
  const navigate = useNavigate() ;
  const [selectedTab , setSelectedTab] = useState('login') ;
  const isAuth = useSelector(state=> state?.auth?.isAuthenticated) ;
  console.log(isAuth);
  
  useEffect(() => {
    if(selectedTab === 'API') {
      window.open('http://locahost:3000/api-docs' , '_blank') ;
    } else if(selectedTab === 'GitHub') {
      window.open('https://github.com/VivekDudi-Github/XConnect' , '_blank') ;
    } else if(selectedTab === 'XConnect'){
      if(isAuth) navigate('/') ;
      else {
        setSelectedTab('login') ;
        toast.info('Please login to access XConnect') ;
      }
    }
  } , [selectedTab])
  


  return (
    <div className="min-h-screen bg-black flex items-center md:justify-end justify-center px-4  -z-30">
      <img className='fixed object-cover h-full inset-0 scale-110 ' src='./login-bg.jpg' />
      
      {/* tabs */}
      <div className=' py-4 w-full flex absolute left-0 px-8 top-0 text-white text-base bg-black justify-between flex-wrap'>
        <div className='text-base gap- flex flex-wrap'>
          {Tab.map((t ,i) => 
            <span 
            key={i}
            className={`${selectedTab === t ? 'text-white underline underline-offset-8 ' : 'text-gray-400 '} hover:cursor-pointer duration-200 ml-4`} 
            onClick={() => setSelectedTab(t)}
            >{t}</span>
          )}
        
        </div>
        <div className={`${selectedTab === 'login' ? 'text-white font-[700]' : 'text-gray-300 '} hover:cursor-pointer ml-4`} onClick={() => setSelectedTab('login')}>Login/Signup</div>
      </div>

      {/* login box */}
      {selectedTab === 'login' && !isAuth && <LoginForm />}
      {selectedTab === 'About' && <AboutTab />}
      {selectedTab === 'Architecture' && <ArchitectureTab />}
    </div>
  );
}


