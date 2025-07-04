import { EditIcon, Loader2Icon, Send, SettingsIcon, UserCheck2, UserPenIcon, UserPlus2Icon } from 'lucide-react';
import {useParams} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { setIsProfileEdit } from '../../redux/reducer/miscSlice';
import { useGetProfileQuery, useToggleFollowMutation } from '../../redux/api/api';
import { useEffect , useState } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from '../specific/socket';

function ProfileHeader() {
  const {username} = useParams();

  const dispatch = useDispatch() ;
  const {user : userProfile} = useSelector(state => state.auth) ;
  
  const [user , setUser]  = useState({}) ;
  const [followStatus , setFollowStatus] = useState(false) ;
  const socket = useSocket() ;
  

  const [followToggleMutation , {isLoading : followIsLoading} ] = useToggleFollowMutation() ;
  const {data ,isError , error , isLoading}  = useGetProfileQuery(username , {skip : !username})

  useEffect(() => {
    if(data && username) {
      setUser(data?.data) ; 
      setFollowStatus(data?.data?.isFollowing)
    }
  } , [data ,username])

  useEffect(() => {
    if(!username) setUser(userProfile) ;
  } , [userProfile] )

  useEffect(() => {
    if(isError){
      console.log(error);
      toast.error(error?.data?.message || "Couldn't fetch the profile. Please try again.");
    } ;
  } , [isError , error])

  const handleFollowToggle = async() => {
    if(username === userProfile.username) return ;
    try {
      const res = await followToggleMutation({id : user._id}) ;
      console.log(res);
      
      if(res.data.data.operation === true){
        setFollowStatus(true)
      }else {
        setFollowStatus(false)
      }
    } catch (error) {
      console.log('error in toggling follow' , error)
      toast.error('Error while doing the follow operations.')
    }
  }
  
  return (
      <>
        <div className='relative w-full'>
          <img className='w-full h-40 bg-gradient-to-b from-gray-300 to-gray-500 -z-20 object-cover ' 
            src={ user?.banner?.url || null}
            alt="banner" />
          <div className='bg-gradient-to-b to-gray-800 via-transparent from-transparent absolute w-full h-full z-0 top-0'/>
        </div>
        <div className="flex flex-col relative items-center px-3 pt-2 gap-3 dark:bg-black sm:flex-row sm:items-start sm:gap-6">
          
          <div>
            <img
              src={ user?.avatar?.url || '/avatar-default.svg' } 
              alt="Profile"
              className="w-28 h-28 mx-auto rounded-full object-cover border-2 border-gray-300"
            />
          <h2 className="text-base text-center block p-2 dark:text-slate-400 text-cyan-600">@{user?.username}</h2>
          </div>
          <div className='pt-2  sm:w-auto  w-full'>
            <h2 className="text-3xl font-semibold dark:text-gray-200" >{user?.fullname}</h2>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm">{user?.hobby} • 🇮🇳 {user?.location || (
              <>
              <img className='size-5 inline-block' src="/XConnect_icon.png" alt="" />Connect                
              </>
            )}</p>
            <p className="mt-2 text-gray-700 dark:hover:text-gray-200 dark:text-gray-500">{user?.bio}</p>
            <div className="flex gap-6 mt-4 text-sm text-gray-700 dark:text-gray-500">
              <span><strong className='dark:text-gray-300'>132</strong> Posts</span>
              <span><strong className='dark:text-gray-300'>1.2k</strong> Followers</span>
              <span><strong className='dark:text-gray-300'>450</strong> Following</span>
            </div>
            {user.username === userProfile?.username ? (
              <button 
              onClick={() => dispatch(setIsProfileEdit(true))}
              className="mt-4 mr-3 px-2 py-[3px] text-sm flex gap-1 items-center justify-center font-semibold rounded-md text-cyan-500 dark:text-black bg-white duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-sm shadow-black/40">
                <UserPenIcon size={17}/> <p>Edit Profile </p>
              </button>
              ) : (
              <div className='flex'>
                <button
                onClick={handleFollowToggle}
                className={`mt-4 mr-3 px-2 py-[3px] font-sm flex gap-1 items-center justify-center font-semibold rounded-md text-cyan-500 dark:text-black bg-white duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-sm shadow-black/40 `}
                >
                  {followIsLoading ? (<Loader2Icon className='animate-spin' size={17} />) : 
                   followStatus ? <UserCheck2 size={17}/> : <UserPlus2Icon size={17}/> 
                  }
                <p>{followStatus ? 'Following' : 'Follow' }</p>
                </button>
                
                <button
                // onClick={() => navigate(`/messages/${profile._id}`)}
                className="mt-4 mr-3 px-2 py-[3px] font-sm flex gap-1 items-center justify-center font-semibold  dark:text-black dark:bg-white rounded-md text-cyan-500 duration-200 hover:bg-gray-200 hover:scale-105 active:scale-95 shadow-sm shadow-black/40"
                >
                  <Send size={17}/> <p>Message</p>
                </button>
            </div>
            )}
          </div>

          {user.username === userProfile?.username && (
          <button title='Settings' className=' absolute sm:hidden block  right-2 p-2 text-gray-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black duration-300 active:scale-90'>
            <SettingsIcon/>
          </button>
          )}
          {user.username === userProfile?.username && (
          <button title='Edit Profile' className=' absolute sm:hidden block top-14 right-2 p-2 text-cyan-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black transition-colors duration-300 active:scale-95'
            onClick={() => dispatch(setIsProfileEdit(true))}
          >
            <EditIcon/>
          </button>
          )}
        </div>
      </>
    );
  }
  



export default ProfileHeader