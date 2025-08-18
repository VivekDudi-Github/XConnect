import { XIcon } from 'lucide-react';
import { useState } from 'react';
import {toast} from 'react-toastify'
import {useNavigate} from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setIsCreateCommunityDialog } from '../../redux/reducer/miscSlice';
import { useCreateCommunityMutation } from '../../redux/api/api';

import '../../assets/styles.css';

export default function CreateCommunityPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState([]);
  const [tags, setTags] = useState([]);
  const [icon, setIcon] = useState(null);
  const [banner, setBanner] = useState(null);

  const [inputValue, setInputValue] = useState("");
  const [rulesText, setRulesText] = useState("");

   const addTag = (e) => {
    e.preventDefault() ;
    const newTag = inputValue.trim();
    if(tags.length > 10) {
      toast.error('Maximum 10 tags allowed');
      return;
    }
    if (
      newTag &&
      !tags.includes(newTag.toLowerCase()) &&
      tags.length < 10
    ) {
      setTags([...tags, newTag]);
      setInputValue("");
    }
  };

  const addRule = (e) => {
    e.preventDefault() ;
    const newTag = rulesText.trim();
    if(rules.length > 20) {
      toast.error('Maximum 20 rules allowed.');
      return;
    }
    if (newTag && !tags.includes(newTag.toLowerCase())) {
      setRules([...tags, newTag]);
      setRulesText("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };



  const handleImageChange = (e) => {
    setIcon(e.target.files[0]);
  };

  const [createMutation , {data , isLoading , error , isSuccess}] = useCreateCommunityMutation() ;

  const handleSubmit = async(e) => {
    e.preventDefault();

    const form = new FormData() ;
    form.append('name' , name) ;
    form.append('description' , desc) ;
    form.append('rules' , rules) ;
    tags.forEach(tag => {
      form.append("tags[]", tag);
    });
    form.append('avatar' , icon) ;  
    form.append('banner' , banner) ;  

    try {
      const res = await createMutation(form).unwrap()
      console.log(res);
      
      if(res.success === true){
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
            className="w-full p-1 focus:pl-3 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
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
             className="w-full p-1 focus:pl-3 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
          />
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium mb-1">Rules</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              className="w-full p-1 focus:pl-3 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
              placeholder="Type a tag and press Enter"
            />
            <button type='button'
              onClick={addRule}
              className="bg-white  text-black font-semibold active:scale-95 duration-200 shadow-slate-500 dark:shadow-none shadow-md  px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={rules.length >= 15 || !rulesText.trim()}
            >
              Add
            </button>
          </div>
          <ol className="space-y-2 list-decimal list-inside text-gray-800 dark:text-gray-200">
            {rules.map((rule, index) => (
              <li
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 fade-in "
              >
                <XIcon
                  size={16}
                  className="cursor-pointer text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
                  onClick={() =>
                    setRules((prev) => prev.filter((r, i) => i !== index))
                  }
                />
                <span className="flex-1 text-sm">{rule}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          
          {/* Tag List */}
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm fade-in "
              >
               {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-white hover:text-red-300"
                >
                  <XIcon size={14} />
                </button>
              </span>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex gap-2">  
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-1 focus:pl-3 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white shadowLight"
              placeholder="Type a tag and press Enter"
            />
            <button
              onClick={addTag}
              className="bg-white  text-black font-semibold active:scale-95 duration-200 shadow-slate-500 dark:shadow-none shadow-md  px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={tags.length >= 10 || !inputValue.trim() || inputValue.split(' ').length > 1}
            >
              Add
            </button>
          </div>

          {/* Tag Limit Message */}
          {tags.length >= 10 && (
            <p className="text-red-500 text-sm mt-1">Maximum 10 tags allowed</p>
          )}
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
