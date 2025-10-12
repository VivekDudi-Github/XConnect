import { useState, useRef, useEffect } from "react";
import Textarea from 'react-textarea-autosize';
import '../../assets/styles.css'
import { useSocket } from "../specific/socket";
import { useBroadcast } from "../specific/broadcast/Broadcaster";
import { useCreateLiveMutation, useUpdateLiveMutation } from "../../redux/api/api";
import { toast } from "react-toastify";
import WatchLive from "./WatchLive";

export default function StartLive() {
  const socket = useSocket();
  
  const [title, setTitle] = useState( new Date().toLocaleString() );
  const [isLive, setIsLive] = useState(false);
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [streamId , setStreamId ] = useState('') ;
  const videoRef = useRef();
  const inputRef = useRef();

  const [createLive ] = useCreateLiveMutation() ;
  const [updateLiveMutation] = useUpdateLiveMutation() ;

  const startPreview = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream ;
  };

  const {startBroadcast , stopBroadcast , videoProducer , audioProducer , isLive : mediasoupReady , localStreamRef } = useBroadcast(socket , true ) ;

  const goLive = async() => {

    const formData = new FormData() ;
    formData.append('title' , title) ;
    formData.append('description' , description) ;
    if(thumbnail) formData.append('media' , thumbnail) ;

    try {
      await startBroadcast(true , null );
      const data = await createLive(formData).unwrap() ;
      console.log('live' ,data.data);
      setStreamId(data.data._id);

    } catch (error) {
      stopBroadcast() ;
      console.log(error?.data?.message);
      return toast.error(error?.data?.message || 'Error creating live stream' );
    }
  };

  useEffect(() => {
    const update = async() => {
      if(videoProducer && mediasoupReady && streamId){
        await updateLiveMutation({id : streamId , videoId : videoProducer.id})
      }
      if(audioProducer && mediasoupReady && streamId){
        await updateLiveMutation({id :streamId , audioId : audioProducer.id})
      }
      if(videoProducer && mediasoupReady && streamId && audioProducer) setIsLive(true) ;
    }
    update() ;
  } , [videoProducer , audioProducer , streamId ])

  return (
    <>
      {isLive ? (
        <div className="p-6 flex md:flex-row flex-col gap-4  min-h-screen dark:text-white bg-gray-50 dark:bg-black">
      {/* form */}
          <div className="w-full  space-y-3">
            <h1 className="text-2xl font-bold mb-4 flex ">Go Live</h1>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="custom_Input shadowLight" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea maxRows={5}
                type="text"
                className="custom_Input shadowLight" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 px-4 py-2 shadowLight dark:border-[1px] border-white rounded-md" onClick={()=> inputRef.current.click()}
                >Thumbnail Select
              </label>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="hidden" 
              />
              {thumbnail && <img src={URL.createObjectURL(thumbnail)} onClick={() => inputRef.current.click()} className="w-full h-full max-h-80 object-contain rounded-2xl" />}
            </div>
            {!isLive ? (
              <button onClick={goLive} className="px-6 py-3 bg-red-600 text-white rounded-xl w-full showdow-lg shadow-red-400/20 hover:bg-red-700 transition">
                🔴 Go Live
              </button>
            ) : (
              <button className="px-6 py-3 bg-gray-600 text-white rounded-xl w-full">
                Live...
              </button>
            )}
          </div>
          {/* side preview */}
          <div className=" flex flex-col  h-full md:max-w-[50%] sm:mt-20 mt-2 ">
            <button onClick={startPreview} className="shadowLight w-full px-4 py-2 rounded-xl mb-2  dark:bg-white text-black active:scale-95 ">
              Start Preview
            </button>
            <video ref={videoRef} autoPlay className="w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <WatchLive localStreamRef={localStreamRef} stopBroadcast={stopBroadcast} />
      )}
    </>
  );
}

// title , description , thumbnail , host , startedAt , endedAt , isLive , viewersCount , producers ( videoId , audioId )