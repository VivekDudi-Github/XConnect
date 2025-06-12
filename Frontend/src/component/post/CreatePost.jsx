import { useState, useRef } from 'react';
import { Smile, ImagePlus, Loader2, X } from 'lucide-react';
import data from '@emoji-mart/data';
import  Picker  from '@emoji-mart/react';
import { useDropzone } from 'react-dropzone';

export default function CreatePost({ user, onSubmit }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef(null);
  const imageInputRef  = useRef(null);

  const onDrop = (acceptedFiles) => {
    const newMedia = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file) ,
      type : file.type.startsWith('image/') ? 'image' : 'video',
    }));
    setMedia(prev => [...prev, ...newMedia]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': [],
    },
    noClick: true ,
    onDrop,
    multiple: true,
    maxFiles: 5,
  });

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) return;

    setLoading(true);
    await onSubmit({
      content,
      media: media.map(m => m.file), // Send actual files
    });
    setContent('');
    setMedia([]);
    setLoading(false);
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji.native);
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const detectHashtags = () => {
    const matches = content.match(/#[\w]+/g);
    return matches || [];
  };

  return (
    <div {...getRootProps()} className="mt-2 w-full max-w-3xl mx-auto dark:bg-gradient-to-b dark:from-slate-950 dark:to-black rounded-2xl p-4 shadow-lg shadow-slate-800/50 text-white duration-200">
      <div className="flex items-start space-x-4">
        <img
          src={user?.avatar || 'https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 ">
          <textarea
            ref={inputRef}
            rows="3"
            className="w-full bg-transparent text-black/60 dark:text-white resize-none placeholder-zinc-400 p-2 outline-none border-b-2 border-gray-300 duration-200"
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {media.map((m, i) => (
                <div key={i} className="relative">
                  { m.type === 'image' ? (
                    <img src={m.preview} className="rounded-xl max-h-52 object-cover w-full" /> )
                  : ( <video src={m.preview} controls className="rounded-xl max-h-52 object-cover w-full" /> )}
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-4">
              <div className="cursor-pointer dark:text-zinc-400  dark:hover:text-white hover:text-cyan-500 text-cyan-400 transition"
              onClick={() => imageInputRef.current.click()}
              
              >
                <input {...getInputProps()} ref={imageInputRef}/>
                <ImagePlus size={20} />
              </div>
              <button
                onClick={() => setShowEmojiPicker(prev => !prev)}
                className="dark:text-zinc-400 text-cyan-400 hover:text-cyan-500 dark:hover:text-white transition"
              >
                <Smile size={20} />
              </button>
            </div>
            {media.length < 2 && <div className='animate-pulse dark:text-white text-black opacity-20 '>
              You can drag  & drop media.
            </div>}
            <button
              onClick={handlePost}
              disabled={loading || (!content.trim() && media.length === 0)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute z-50 mt-2">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                style={{ width: '100%' }}
              />
            </div>
          )}

          {detectHashtags().length > 0 && (
            <div className="mt-2 text-xs text-indigo-400">
              Detected hashtags: {detectHashtags().join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
