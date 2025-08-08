import { useState } from 'react';

export default function CreateCommunityPage() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [rules, setRules] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState(null);
  const [banner, setBanner] = useState(null);

  const handleImageChange = (e) => {
    setIcon(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const communityData = {
      name,
      desc,
      rules,
      category,
      icon,
    };
    console.log('Creating community:', communityData);
    // Upload logic here
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-transparent text-black dark:text-white rounded-xl shadow-lg border border-gray-700"> 
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
            className="w-full p-2 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
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
             className="w-full p-2 rounded dark:bg-gradient-to-b dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
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
            className="w-full p-2 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
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
