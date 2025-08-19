import { useState ,useEffect} from 'react';
import {SmileIcon, XIcon} from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setIsCreateCommunityPostDialog } from '../../redux/reducer/miscSlice';
import {toast} from 'react-toastify';
import { useCreatePostMutation } from '../../redux/api/api';
import data from '@emoji-mart/data';
import  Picker  from '@emoji-mart/react';
import { useParams } from 'react-router-dom';

export default function CreateCommunityPost() {
  const params = useParams() ;
  const communityId = params.id ;

  const dispatch = useDispatch();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hashtags  , sethashTags] = useState([])
  const [mentions , setMentions] = useState([]) ;


  const handleIMediaUpload = (e) => {
  setMedia([...media , ...e.target.files]);
  };
  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };


  const [createMutation ]= useCreatePostMutation() ; 

  const handleSubmit = async(e) => {
    e.preventDefault();
    const toastId = toast.loading('Posting...') ;


    const form = new FormData() ;
    form.append('title' , title) ;
    form.append('content' , content) ;
    form.append('community' , communityId) ; 
    form.append('category' , category) ;
    form.append('isAnonymous' , isAnonymous) ;
    form.append('isCommunityPost' , true) ;
    hashtags.forEach((tag) => {
      form.append(`hashtags[]` , tag)
    }) ;
    mentions.forEach((mention) => {
      form.append(`mentions[]` , mention)
    }) ;
    media.length > 0 && media.forEach(m => form.append('media' , m)) ;
    try {
      const res = await createMutation(form).unwrap()

      console.log(res);
      console.log(res.success);
      
      if(res.success === true){
        toast.update(toastId, {
          render: "Posted successfully",
          type: "success",
          isLoading: false,
          draggable: true,
          autoClose: 2000,
        });
        closeHandler();
      } 
    } catch (error) {
      console.log(error);
      toast.update(toastId , {
        render: error.data?.message || 'Something went wrong. Please try again.' ,
        type: 'error' ,
        isLoading: false, 
        autoClose: 2000, 
      })
    }

  }

  const closeHandler = () => {
    setTitle('');
    setContent('');
    setMedia([]);
    setCategory('');
    setIsAnonymous(false);
    dispatch( setIsCreateCommunityPostDialog(false))
  }

useEffect(() => {
    const detectHashtags = () => {
      const matches = content.match(/#[\w]+/g);
      sethashTags(matches || []); 
      return matches || [];
    };
  
    const detectMentions = () => {
      const matches = content.match(/@[\w]+/g);
      setMentions(matches || []);
      return matches || [] ;
    };

    detectHashtags() ;
    detectMentions() ;
  } , [content]);
  
const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji.native);
  };

  return (
    <div className="max-w-2xl pb-16 sm:pb-0 mx-auto mt-10 bg-zinc-100 dark:bg-[#161b22] dark:text-white p-6 rounded-xl border border-gray-700 shadow-lg relative">
      <button title='Close' className=' absolute right-2 p-1 text-gray-600 bg-gray-100 hover:bg-gray-300 rounded-lg dark:bg-black  dark:text-white   dark:hover:bg-white shadow-sm shadow-black/60 dark:hover:text-black duration-300 active:scale-90 '
      onClick={closeHandler}
      > 
        <XIcon />
      </button>
      <h2 className="text-2xl font-bold mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title<span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full p-2 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Content */}
        <div className='relative '>
          <label className=" text-sm  flex gap-2 items-centerfont-medium mb-1">Description / Question 
          <button 
            type='button'
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className="dark:text-zinc-400 text-cyan-400 hover:text-cyan-500 dark:hover:text-white transition"
          >
            <SmileIcon size={20} />
          </button>

          {showEmojiPicker && (
            <div 
            className="absolute z-50 mt-2 top-8 right-0">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                style={{ width: '100%' }}
              />
            </div>
          )}

          </label>
          <textarea
            rows="5"
            className="w-full p-2 rounded dark:bg-gradient-to-t dark:from-gray-800 dark:to-black duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-white"
            placeholder="Share your thoughts, ask a question, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        {/* Category*/}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white dark:bg-black border text-black  dark:text-white border-gray-600 rounded px-3 py-2 focus:outline-none"
          >
            <option value="">Select a category</option>
            <option value="general">General</option>
            <option value="help">Help</option>
            <option value="feedback">Feedback</option>
            <option value="showcase">Showcase</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Attach Image (optional)</label>
          <input multiple
            type="file"
            accept="image/* video/*"
            onChange={handleIMediaUpload}
            className="text-sm text-gray-300"
          />
          
          <div className=' max-h-64 overflow-x-scroll flex w-full'> 
            {media.length > 0 && media.map((m ,i) => {
              return (
              <div className='relative max-h-60 min-w-32' key={i}>
                {m.type.slice(0 , 5) === 'image' ? ( 
                  <img src={URL.createObjectURL(m)} alt={m.name} className="rounded-lg max-h-60 object-cover w-full" /> )
                : ( <video src={URL.createObjectURL(m)} controls className="rounded-lg max-h-60 object-cover w-full" /> )}
                <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                  >
                    <XIcon size={16} />
                </button>
              </div>
            );
            }) }
          </div>
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
            onClick={() => closeHandler()}
            className="bg-white  text-black font-semibold active:scale-95 duration-200 shadow-slate-500 dark:shadow-none shadow-md  px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
          <div className="flex justify-end">
          <button
            type="submit"
            className="bg-white  text-black font-semibold active:scale-95 duration-200 shadow-slate-500 dark:shadow-none shadow-md  px-6 py-2 rounded-lg"
          >
            Create Post
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}
