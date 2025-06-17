import { XIcon } from 'lucide-react';
import {useRef , useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';

import {setIsProfileEdit} from '../../redux/reducer/miscSlice'
import { updateUser } from '../../redux/reducer/authSlice'
import { useUpdateProfileMutation } from '../../redux/api/api';

import {toast} from 'react-toastify'


function EditProfile() {
  const dispatch = useDispatch() ; 
  const {user} = useSelector(state => state.auth)

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [updateMutation] = useUpdateProfileMutation() ;

  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    bio: user?.bio || '',
    hobby: user?.hobby || '', 
    location: user?.location || '',
    avatar: user?.avatar?.url || '', // avatar URL
    avatarFile: null, // file for upload
    banner: user?.banner?.url || '', // banner URL
    bannerFile : null, // file for upload
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleImageChange = (e , img) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onloadend = () => {
    setForm(prev => ({
      ...prev ,
      [img] : reader.result, 
      [`${img}File`]: file, 
    }))
  }

  reader.readAsDataURL(file) ;
  }

  console.log(form);
  
const handleSubmit = async(e) => {
  const id = toast.loading('Updating profile...') ;

  e.preventDefault() ;
  const data = new FormData()
  data.append('fullname', form.fullname);
  data.append('username', form.username);
  data.append('bio', form.bio);
  data.append('hobby' , form.hobby)
  data.append('location', form.location);
  if (form.avatarFile) {
    data.append('avatar', form.avatarFile);
  }
  if (form.bannerFile) {
    data.append('banner', form.bannerFile);
  }
  

  try {
    const res = await updateMutation(data).unwrap() ;
    
    dispatch(updateUser(res.data))
    toast.update(id , {
      render : 'Profile Upated' ,
      type : 'success' ,
      isLoading: false,
      autoClose: true,
    }  
  ) ;
    dispatch(setIsProfileEdit(false)) ;
  } catch (error) {
    console.log(error);
    toast.update(id , {
      render : error.data.message || "Something went" ,
      type : 'error' ,
      isLoading: false,
      autoClose: true,
    } , 
  ) ;
  }
}

  return  (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-black/90 rounded-xl shadow relative dark:text-white text-black w-full h-screen overflow-auto top-0">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
    <button 
    onClick={() => dispatch(setIsProfileEdit(false))} 
    className='absolute top-3  right-3 p-2 rounded-lg dark:hover:bg-gray-100  dark:hover:text-gray-700 dark:text-gray-300 hover:bg-gray-300 text-gray-700 duration-200'>
      <XIcon size={25}/>
    </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="w-full relative mb-4">
          <div className="absolute top-0 left-0 w-full h-32 z-0 overflow-hidden rounded-lg">
            <img
              src={form?.banner || user?.banner?.url || '/avatar-default.svg'}
              alt="Banner"
              className={`w-full h-full object-cover cursor-pointer ${!form?.banner && !user?.banner?.url ? 'blur-sm ' : ''}`}
              onClick={() => bannerInputRef.current.click()}
            />
            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'banner')}
            />
          </div>

        <div className="relative z-10 flex items-center gap-4 pt-24 px-4 pointer-events-none">
            <div className="relative pointer-events-auto">
              <img
                src={form?.avatar || user?.avatar?.url || '/avatar-default.svg'}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover dark:bg-black bg-white ring-2 ring-white cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'avatar')}
              />
            </div>
          </div>
        </div>



        <span className="text-sm text-gray-400 dark:text-gray-500 animate-pulse  ">Click on avatar & banner to change</span>
        

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            name="fullname"
            type="text"
            value={form.fullname }
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            rows={3}
            value={form?.bio}
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Work</label>
          <input
            name="hobby"
            type="text"
            value={form.hobby}
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            name="location"
            type="text"
            value={form?.location}
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gradient-to-b dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full dark:bg-white hover:bg-black dark:text-black bg-black  text-white font-medium py-2 rounded duration-200"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile