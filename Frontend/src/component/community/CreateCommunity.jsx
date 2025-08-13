import { XIcon } from 'lucide-react';
import { useState } from 'react';
import {toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setIsCreateCommunityDialog } from '../../redux/reducer/miscSlice';
import { useCreateCommunityMutation } from '../../redux/api/api';

export default function CreateCommunityPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState(null);
  const [banner, setBanner] = useState(null);

  const handleImageChange = (e) => {
    setIcon(e.target.files[0]);
  };

  const [createMutation , {data , isLoading , error , isSuccess}] = useCreateCommunityMutation() ;

  const handleSubmit = async(e) => {
    e.preventDefault();
    // const communityData = {
    //   name,
    //   description : desc,
    //   rules,
    //   tags : category,
    //   avatar : icon,
    //   banner
    // };

    const form = new FormData() ;
    form.append('name' , name) ;
    form.append('descriptopn' , desc) ;
    form.append('rules' , rules) ;
    form.append('tags' , category) ;
    form.append('avatar' , icon) ;  
    form.append('banner' , banner) ;  

    try {
      const res = await createMutation(form).unwrap()
      if(res.data.success === true){
        dispatch(setIsCreateCommunityDialog(false))
      } 
    } catch (error) {
      console.log(error);
      toast.error( error.data.message || 'something went wrong. Please try again.')
    }
  };

  return (
    <div className="max-w-3xl max-h-screen overflow-y-auto mx-auto mt-10 p-6 bg-transparent text-black dark:text-white rounded-xl shadow-lg border border-gray-700 relative"> 
      <button title='Close' className=' absolute right-2 p-1 text-gray-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black duration-300 active:scale-90'
        onClick={() => dispatch(setIsCreateCommunityDialog(false))}
      > 
        <XIcon />
      </button>
      
      <h1 className="text-3xl font-bold mb-6">Create a Community</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Community Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Community Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. xconnect-devs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={4}
            placeholder="What's this community about?"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
             className="w-full p-2 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
          />
        </div>

        {/* Rules */}
        <div>
          <label className=" inline-block text-sm font-medium rounded-t-md">Community Rules</label> 
          <textarea
            rows={3}
            placeholder="e.g. Be respectful, No spam, etc."
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full p-2 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full dark:bg-[#0d1117] text-black dark:text-white rounded px-3 py-2"
          >
            <option value="">Select a topic</option>
            <option value="tech">Tech</option>
            <option value="gaming">Gaming</option>
            <option value="education">Education</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="news">News</option>
          </select>
        </div>
      
        {/* Icon Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Community Icon </label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {icon && <img src={URL.createObjectURL(icon)} alt="Community Icon" className="mt-2 max-h-20 rounded-lg object-cover " />}
        </div>
        
        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Community Banner </label>
          <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0]) } />
          {banner && <img src={URL.createObjectURL(banner)} alt="Community Banner" className="mt-2 max-h-20 rounded-lg object-cover" />}
        </div>
        

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-white  text-black font-semibold active:scale-95 duration-200 shadow-slate-500 dark:shadow-none shadow-md  px-6 py-2 rounded-lg"
          >
            Create Community
          </button>
        </div>
      </form>
    </div>
  );
}
