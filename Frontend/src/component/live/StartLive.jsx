import { useState, useRef, useEffect } from "react";
import Textarea from 'react-textarea-autosize';
import '../../assets/styles.css'
import { useSocket } from "../specific/socket";
import { useBroadcast } from "../specific/broadcast/Broadcaster";
import { useCreateLiveMutation, useUpdateLiveMutation } from "../../redux/api/api";
import { toast } from "react-toastify";
import WatchLive from "./WatchLive";
import { ensureSocketReady } from "../shared/SharedFun";
import DialogBox from "../shared/DialogBox";

export default function StartLive() {
  const socket = useSocket();

  const [isRoomAvailable , setIsRoomAvailable] = useState(false);
  const isRoomAvailableTimeRef = useRef(false) ;

  const [title, setTitle] = useState( new Date().toLocaleString() );
  const [isLive, setIsLive] = useState(false);
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [streamData , setStreamData ] = useState('') ; 
  const videoRef = useRef();
  const inputRef = useRef();

  const [createLive ] = useCreateLiveMutation() ;
  const [updateLiveMutation] = useUpdateLiveMutation() ;

  const startPreview = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream ;
  };
  // fetch live stream data of any accidental disconnects and resume stream if any
  // allow host to rejoin stream within 5min of accidental disconnect
   
  const {startBroadcast , stopBroadcast , videoProducer , audioProducer , isLive : mediasoupReady , localStreamRef } = useBroadcast(socket , true ) ;

  const goLive = async() => {
    if(!socket) await ensureSocketReady(socket);
    let isAvailable = false ;
    socket.emit('CHECK_AND_UPDATE_LIVE_HOST' , {roomId : 'temp'} , (res) => {
      if(res.isAvailable){
        setIsRoomAvailable(true) ; isAvailable = true ;
        isRoomAvailableTimeRef.current = res.isAvailableTime ;
      }}
    )
    if(isAvailable) return ;
    const formData = new FormData() ;
    formData.append('title' , title) ;
    formData.append('description' , description) ;
    if(thumbnail) formData.append('media' , thumbnail) ;

    try {
      await startBroadcast(true , null );
      const data = await createLive(formData).unwrap() ;
      console.log('live' ,data.data);
      setStreamData(data.data);

    } catch (error) {
      stopBroadcast() ;
      console.log(error?.data?.message);
      return toast.error(error?.data?.message || 'Error creating live stream' );
    }
  };

  useEffect(() => {
    const update = async() => {
      if(videoProducer && mediasoupReady && streamData){
        await updateLiveMutation({id : streamData._id , videoId : videoProducer.id})
      }
      if(audioProducer && mediasoupReady && streamData){
        await updateLiveMutation({id :streamData._id , audioId : audioProducer.id})
      }
      console.log(!!videoProducer , !!mediasoupReady , !!audioProducer , !!streamData);
      
      if(videoProducer && mediasoupReady && streamData && audioProducer) setIsLive(true) ;
    }
    update() ;
  } , [videoProducer , audioProducer , streamData ])

  const removeLiveHost = () => {
    socket.emit('REMOVE_LIVE_HOST') ;
    setIsRoomAvailable(false) ;
  }
  const rejoinLiveStream = () => {
    socket.emit('REJOIN_LIVE_STREAM' , {roomId : 'temp'} , async(res) => {
      if(res) setIsRoomAvailable(true) ;
    })
  }

  useEffect(() => {
    if(isRoomAvailable && isRoomAvailableTimeRef.current){
      let interval = setInterval(() => {
        if(isRoomAvailableTimeRef.current <= 0){
          clearInterval(interval) ;
          removeLiveHost() ;
        }else {isRoomAvailableTimeRef.current -= 1000 ; }
      } , 1000)
    }
  }, [isRoomAvailable] )

  return (
    <>
      {!isLive ? (
        <div className="p-6 flex md:flex-row flex-col gap-4  min-h-screen dark:text-white bg-gray-50 dark:bg-black">
      {/* form */}
          <div className="w-full  space-y-3">
            <h1 className="text-2xl font-bold mb-4 flex ">Go Live <span className="text-sm text-gray-600 italic">tap go live to rejoin disconnected stream.</span></h1>
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
          {isRoomAvailable && (
            <DialogBox message={'You have an ongoing live stream. Do you want to stop the previous stream ?'} onClose={() => removeLiveHost()} mainFuction={rejoinLiveStream} />
          )}
        </div>
      ) : (
        <WatchLive localStreamRef={localStreamRef} stopBroadcast={stopBroadcast} isProducer={true} streamData={streamData} />
      )}
    </>
  );
}

// title , description , thumbnail , host , startedAt , endedAt , isLive , viewersCount , producers ( videoId , audioId )