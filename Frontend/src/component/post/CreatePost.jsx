import { useState, useRef, useEffect } from 'react';
import { Smile, ImagePlus, Loader2Icon, X,  CalendarClockIcon, UploadIcon, CheckCircleIcon } from 'lucide-react';
import data from '@emoji-mart/data';
import  Picker  from '@emoji-mart/react';
import { toast } from 'react-toastify';

import { useDropzone } from 'react-dropzone';
import { useCreatePostMutation } from '../../redux/api/api';
import { useSelector } from 'react-redux';
import UploadVideo from '../shared/uploadVideo';
import DialogBox from '../shared/DialogBox';
import VideoPlayer from '../specific/videPlayer/VideoPlayer';


export default function CreatePost() {
  const {user}  = useSelector(state => state.auth) ;
  const [showDialog , setShowDialog] = useState(false) ;
  const [oldPendingUpload , setOldPendingUpload] = useState([]) ;

  const [loading, setLoading] = useState(false);
  const [ openVisiblity ,setOpenVisiblity] = useState(false) ;


  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(null) ;
  const [hashtags  , sethashTags] = useState([])
  const [mentions , setMentions] = useState([]) ;
  const [repost, setRepost] = useState(null);

  const VideosIds = useRef([]) ;
  const [videoUploaded , setVideoUploaded] = useState([]) ;


  const inputRef = useRef(null);
  const imageInputRef  = useRef(null);

  const [createPostMutate] =  useCreatePostMutation();
  const {isUploading , progress , InitUpload , fileName} = UploadVideo() ; 

  
  const onDrop = (acceptedFiles) => {
    const newMedia = acceptedFiles.map(file => {
    if(file.type.startsWith('video/')) checkPendingUpload(file) ;
    
    return {file,
      preview: URL.createObjectURL(file) ,
      type : file.type.startsWith('image/') ? 'image' : 'video',
    } });
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

  const submitPost = async () => {
    if (!content.trim() && media.length === 0) return toast.error('Post cannot be empty.');
    console.log(VideosIds.current);
    
    setLoading(true);
    
    const form = new FormData();
    form.append('content', content);
    if(scheduledAt) form.append('scheduledAt' , new Date(scheduledAt).toUTCString())
    
    hashtags.forEach((tag) => {
      form.append(`hashtags[]` , tag)
    }) ;
    mentions.forEach((mention) => {
      form.append(`mentions[]` , mention)
    }) ;
    
    media.length > 0 && 
    media.forEach((m) => {
      if(m.type === 'image') form.append('media' , m.file )
    }) 
    VideosIds.current.forEach((id) => {
      form.append('videoIds[]' , id)
    }) ;
    if(repost){
      form.append('repost', repost);
    }

    try {
      console.log(form.get('videoIds') );
     const data = await createPostMutate(form).unwrap();
      if (data) {
        toast.success('Post created successfully!'); 
        setContent('');
        setMedia([]);
        VideosIds.current = [] ;
        setVideoUploaded([]) ;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.data?.message || "Couldn't create the post. Please try again.");
    } finally{
      setLoading(false);
      setShowEmojiPicker(false);
    }
  };

  const upload = async(file , isSingleUp = false) => {
    const videos = isSingleUp ? [file] : media.filter(m => m.type === 'video') ;
    console.log(videos);
    
    for(const v of videos){
      if(videoUploaded.find(vid => vid.name === v.file.name)) continue ;
      const res = await InitUpload(v) ;
      if(!res?.public_id) {
        throw new Error('Video upload failed') ;
      } ;
      
      VideosIds.current.push( res.public_id ) ; 
      setVideoUploaded(prev => [...prev , v.file]);
    }
  }

  const finalSubmit = async() => {
    setLoading(true) ;  
    try {
      await upload() ;
      await submitPost() ;
    } catch (error) {
      console.log(error);
      setLoading(false) ;
    }
  }

  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji.native);
  };

  const removeMedia = (m) => {
    setMedia(prev => prev.filter((j) => j.file.name !== m.file.name)); 
  };

  useEffect(() => {
    const detectHashtags = () => {
      const matches = content.match(/#[\w]+/g);
      sethashTags(matches || []); 
      return matches || [];
    };
  
    const detectMentions = () => {
      const matches = content.match(/@[\w]+/g) || [];
      setMentions(matches.map(m => m.slice(1)) || []);
      return matches || [] ;
    };

    detectHashtags() ;
    detectMentions() ;
  } , [content]);
  
  const addSchedule = (e) => {
    let newSchedule = new Date(e.target.value) ;
    if(newSchedule < new Date()){
      setScheduledAt(null);
      return toast.error('Past dates are not allowed ! Schedule is cleared.') ; 
    } 
    setScheduledAt(newSchedule);
  }
  
  const uploadButtonHandler = (m) => {
    if(fileName === m.file.name) return ;
    videoUploaded.find(v => v.name == m.file.name) ? null : upload(m , true) ;
  }

  const removePendingUpload = (e) => {
    localStorage.removeItem(e.fingerprint) ;
    setOldPendingUpload(prev => prev.filter(v => v.name !== e.name)) ;
  }

  const checkPendingUpload = (e) => {
    let fingerprint = `activeUpload:${e.name}-${e.size}-${e.lastModified}` ;
    if(localStorage.getItem(fingerprint)) setOldPendingUpload(prev => prev.filter(v => v.name !== e.name)) ; ;
  }
  const removeAllPendingUpload = () => {
    setOldPendingUpload([]) ;
    for(let i = 0 ; i < localStorage.length ; i++){
      localStorage.key(i).startsWith('activeUpload:') && localStorage.removeItem( localStorage.key(i) ) ;
    }
    setShowDialog(false) ;
  }

  useEffect(() => {
    function run(){
      let isAvailable = Object.keys(localStorage).filter(e => e.startsWith('activeUpload:'))
      if(isAvailable.length > 0) {
        setShowDialog(true) ;
        let arr = [] ;
        isAvailable.forEach(e => arr.push(JSON.parse(localStorage.getItem(e))  )) ;
        setOldPendingUpload(arr) ;
      }
    }
    run()
  } , [])

  

  return (
    <div {...getRootProps()} className="mt-2 w-full max-w-3xl mx-auto dark:bg-gradient-to-b dark:from-slate-950 dark:to-black rounded-2xl p-4 shadow-md shadow-slate-600/50  text-white duration-200">
      <div className="flex items-start space-x-4">
        <img
          src={user?.avatar?.url || 'https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 ">
          <textarea
            ref={inputRef}
            rows="3"
            className="w-full bg-transparent text-black/60 dark:text-white resize-none font-sans placeholder-zinc-400 p-2 outline-none border-b-2 border-gray-300 duration-200"
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {media.length > 0 && (
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-2 mt-3">
              {media.map((m) => (
                <div key={m.file.name+m.file.size} className="relative">
                  { m.type === 'image' ? (
                    <img src={m.preview} className="rounded-xl max-h-52 object-cover w-full" /> 
                  ) : (
                    <div className=' max-h-60  w-full'> 
                      <VideoPlayer src={m.preview} type={m.file.type} />
                    </div>
                  )} 
                  
                  <button
                    onClick={() => removeMedia(m)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                  <button hidden={m.type === 'image'}
                    onClick={() => uploadButtonHandler(m)}
                    className="absolute top-1 right-8 bg-black/60 text-white p-1 rounded-full hover:bg-black duration-200"  
                  >
                    {fileName === m.file.name ? <>
                      <span className='text-xs flex justify-center items-center gap-1'><Loader2Icon size={16} className='animate-spin'/> {Math.round(progress) }%</span>
                    </> : <>
                      {videoUploaded.find(v => v.name == m.file.name) ? <CheckCircleIcon size={16} /> : <UploadIcon size={16} />} 
                    </>}
                  </button>
                </div>
              ))}
            </div>
          )}
          
      
          <div className="flex flex-wrap justify-between items-center mt-3">
            <div className="flex items-center gap-3">
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
              
              <button title='Schedule post' 
              onClick={() => setOpenVisiblity(prev => true)}
              className="relative text-cyan-400 hover:text-cyan-500 dark:text-zinc-400 dark:hover:text-white transition">
                <CalendarClockIcon size={20} />

                <div className={`absolute left-0 mt-2 w-fit rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black shadow-lg flex flex-col p-1 duration-300 ${openVisiblity ? '' : 'scale-0 -translate-x-24 -translate-y-8 '} `}>
                  <input onChange={addSchedule}  type="datetime-local" onBlur={() => setOpenVisiblity(false)}
                    className='className="flex items-center gap-2 bg-black px-2 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-700 cursor-pointer"' 
                    />  
                </div>
              </button>
              <span className='text-gray-400'>{media.some(m => m.type === 'video') ? `[${videoUploaded.length}/${media.filter(v => v.type === 'video').length} uploaded]` : null }</span>
            </div>
            <div className='animate-pulse dark:text-white text-black opacity-20 '>
              You can drag  & drop media.
            </div>
            <button
              onClick={finalSubmit}
              disabled={loading || (!content.trim() && media.length === 0)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed duration-200"
            >
              {loading ? <Loader2Icon className='animate-spin'/> : 'Post'}
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
          
          {hashtags.length > 0 && (
            <div className="mt-2 text-xs text-indigo-400">
              Detected hashtags: {hashtags.join(', ')}
            </div>
          )}
          {mentions.length > 0 && (
            <div className="mt-2 text-xs text-indigo-400">
              Mentions: {mentions.join(', ')}
            </div>
          )}
          {oldPendingUpload.length > 0 ? (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Earlier Pending Uploads:</span>
              {oldPendingUpload.map( e => 
                <div key={e.fingerprint} className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex">
                  {e.name}
                  <X size={20} onClick={() => removePendingUpload(e)}/>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {showDialog && (
        <DialogBox 
          message={'You have an unfinished video upload. Please re-select the file to resume. '}
          onClose={() => removeAllPendingUpload()}
          mainFuction={() => setShowDialog(false)}
        />
      )}

    </div>
  );
}

