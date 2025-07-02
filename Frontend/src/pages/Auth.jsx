import { useState } from 'react';
import { useRegisterMeMutation , useLoginMeMutation } from '../redux/api/api';
import Loader from '../component/shared/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {login} from '../redux/reducer/authSlice'

export default function AuthPage() {
  const navigate = useNavigate() ;
  const dispatch = useDispatch() ;



  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading , setLoading] = useState(false)

  const UsernameRegex = /^[a-zA-Z0-9_]{3,20}$/; 

  const [email , setEmail] =useState('') ;
  const [password , setPassword] = useState('') ;
  const [username ,  setUsername] = useState('') ;
  const [fullname , setFullname] = useState('') ;

  const [RegisterMutation] = useRegisterMeMutation() ;
  const [LoginMutation] = useLoginMeMutation() ;

  const handleRegister = async(e) => {
    e.preventDefault() ;
    try {
      setLoading(true) ;
      const test = UsernameRegex.test(username) ;
      if(!test) return toast.error('Username can only have alphabets , underscores and numbers.' )
      
      const res = await RegisterMutation({
        email: email,
        password: password,
        username: username,
        fullname: fullname
      }).unwrap() ;
      setIsLogin(true) ;
      toast.info('Tap Login to continue')
    } catch (error) {
      console.log(error);
      return toast.error(error.data.message || 'Something went wrong😢. Please try again.')
    }finally{
      setLoading(false)
    }
  }

  const handleLogin = async(e) => {
    e.preventDefault() ;
    try {
      setLoading(true) ;
      const res = await LoginMutation({
        email , password 
      }).unwrap() ;
      if(res){
        dispatch(login(res.data)) ;
        toast.success('Welcome Back!') ;
        navigate('/') ;
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || 'Something went wrong😢. Please try again.' )
    }finally{
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen dark:bg-black  flex items-center justify-center px-4 -z-30">
      
      <img className=' max-h-sm max-w-sm absolute z-0 object-cover' src='/XConnect_icon.png'/>
      
      <div className="w-full max-w-md bg-white/20 dark:bg-gray-900/50 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-sm shadow-black/70 border dark:border-gray-800 duration-500 overflow transition-all" 
        style={{height : isLogin ? '390px' : '520px'}}
      >
        
        {isLoading && (
          <div className='absolute w-full h-full top-0 left-0 z-10 dark:bg-gray-900/50'>
            <Loader message={isLogin ? 'Connecting You Back..' : 'Joining..'  } /> 
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6 flex justify-center transition-all duration-200 ">
          {isLogin && 'Welcome Back '}
          {!isLogin && 
            <>
            <p className='mr-2'>Join</p>
            <img className=' size-8 inline-block' src='/XConnect_icon.png' />Connect
            </>}
        
        </h2>

        <form 
        onSubmit={isLogin ? handleLogin : handleRegister}
        className="space-y-4"
        >  
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              onChange={e => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                onChange={e => setPassword(e.target.value)}
                value={password}
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-[13px] text-sm text-gray-500 dark:text-gray-300"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>


            <div className={`${isLogin ? ' opacity-0 h-0 -translate-y-5 ' : ''} duration-500 `}>
              <label className="block text-sm text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                style={{height : isLogin ? '0px' : 'auto'}}
                placeholder="Your Username"
                className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required = {!isLogin}
                onChange={e => setUsername(e.target.value)}
                value={username}
              />
            </div>

            <div className={`${isLogin ? ' opacity-0 h-0 -translate-y-5' : ''} duration-500 `}>
              <label className="block text-sm text-gray-700 dark:text-gray-300 ">Fullname</label>
              <input 
                type="text" 
                style={{height : isLogin ? '0px' : 'auto'}}
                placeholder="Your Fullname"
                className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required = {!isLogin}
                onChange={e => setFullname(e.target.value)}
                value={fullname}
              />
            </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition z-50"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                className="text-indigo-500 hover:underline"
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="text-indigo-500 hover:underline"
                onClick={() => {setIsLogin(true)}}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
