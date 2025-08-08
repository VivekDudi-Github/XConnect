import { useState } from 'react';

export default function CreateCommunityPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle post submission
    console.log({ title, content, category, image, isAnonymous });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-[#161b22] text-white p-6 rounded-xl border border-gray-700 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title<span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full bg-[#0d1117] border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-1">Description / Question</label>
          <textarea
            rows="5"
            className="w-full bg-[#0d1117] border border-gray-600 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Share your thoughts, ask a question, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Attach Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-300"
          />
          {image && <p className="mt-1 text-sm text-green-400">Selected: {image.name}</p>}
        </div>

        {/* Category or Tag */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0d1117] border border-gray-600 rounded px-3 py-2 focus:outline-none"
          >
            <option value="">Select a category</option>
            <option value="general">General</option>
            <option value="help">Help</option>
            <option value="feedback">Feedback</option>
            <option value="showcase">Showcase</option>
          </select>
        </div>

        {/* Post anonymously */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(!isAnonymous)}
            className="mr-2"
          />
          <label htmlFor="anonymous" className="text-sm">Post anonymously</label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            onClick={() => {
              setTitle('');
              setContent('');
              setImage(null);
              setCategory('');
              setIsAnonymous(false);
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded font-medium"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
