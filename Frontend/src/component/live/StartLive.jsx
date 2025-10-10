import { useState, useRef } from "react";
import Textarea from 'react-textarea-autosize';
import '../../assets/styles.css'
import { useSocket } from "../specific/socket";
import { useBroadcast } from "../specific/broadcast/Broadcaster";
import { useCreateLiveMutation } from "../../redux/api/api";
import { toast } from "react-toastify";


export default function StartLive() {
  const socket = useSocket();
  
  const [title, setTitle] = useState( new Date().toLocaleString() );
  const [isLive, setIsLive] = useState(false);
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const videoRef = useRef();

  const [createLive ] = useCreateLiveMutation() ;

  const startPreview = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = localStreamRef?.current?.videoStream;
  };

  const {startBroadcast , stopBroadcast , videoProducer , audioProducer , isLive : mediasoupReady , localStreamRef } = useBroadcast(socket , true ) ;

  const goLive = async() => {
    let docId = null ;

    const formData = new FormData() ;
    formData.append('title' , title) ;
    formData.append('description' , description) ;
    if(thumbnail) formData.append('media' , thumbnail) ;


    try {
      await startBroadcast(true , null , docId);
      

      // const data = await createLive(formData).unwrap() ;
      console.log('live');


    } catch (error) {
      console.log(error);
      return toast.error('Error creating live stream' , error);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center min-h-screen dark:text-white bg-gray-50 dark:bg-black">
      <h1 className="text-2xl font-bold mb-4">Go Live</h1>
      <div className="w-full max-w-lg space-y-3">
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
        {/* <div>
          <label className="block text-sm font-medium mb-1">Thumbnail Select<span className="text-red-500">*</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
            className="hidden" 
          />
        </div> */}
        <button onClick={startPreview} className=" px-5 py-3 flex justify-center rounded-xl font-semibold duration-200 text-black bg-white hover:bg-slate-200 transition-all shadow-lg shadowLight">
          Start Preview
        </button>
        <video ref={videoRef} autoPlay muted className="w-full rounded-2xl" />
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
    </div>
  );
}

// title , description , thumbnail , host , startedAt , endedAt , isLive , viewersCount , producers ( videoId , audioId )