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
import { CameraIcon, Loader2Icon, ScreenShare } from "lucide-react";
import moment from "moment";
import 'moment-duration-format';

export default function StartLive() {
  const socket = useSocket();
  const timerRef = useRef(null);

  const [isRoomAvailable , setIsRoomAvailable] = useState(false);
  const [isRoomAvailableTime , setisRoomAvailableTime] = useState(false) ; 

  const [IsCheckingDissconnectedRoom , setCheckingDissconnectedRoom] = useState(true) ;

  const [isCameraOn , setIsCameraOn] = useState(true) ;

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
    let stream ; 
    if(isCameraOn){
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) ;
    }else {
      let displayMedia = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) ;
      let micStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true }) ;
      stream = new MediaStream([...displayMedia.getVideoTracks() , ...displayMedia.getAudioTracks() , ...micStream.getAudioTracks() ]) ;
    }
    videoRef.current.srcObject = stream ;
  };
  // fetch live stream data of any accidental disconnects and resume stream if any
  // allow host to rejoin stream within 5min of accidental disconnect
   
  const {startBroadcast , stopBroadcast , videoProducer , audioProducer , isLive : mediasoupReady , localStreamRef } = useBroadcast(socket , true ) ;

  const goLive = async() => {
    if(isRoomAvailable){
      if(timerRef.current ) clearInterval(timerRef.current) ; 
      rejoinLiveStream() ;
      await startBroadcast(isCameraOn , null );
      return ;
    }
    const formData = new FormData() ;
    formData.append('title' , title) ;
    formData.append('description' , description) ;
    if(thumbnail) formData.append('media' , thumbnail) ;

    try {
      await startBroadcast(isCameraOn , null );
      const data = await createLive(formData).unwrap() ;
      console.log('live' ,data.data);
      setStreamData(data.data);
    } catch (error) {
      stopBroadcast() ;
      console.log(error?.data?.message);
      return toast.error(error?.data?.message || 'Error creating live stream' );
    }
  };
console.log('ss');

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
  const AddHost = async() => {
    if(isLive && !isRoomAvailable) socket.emit('ADD_LIVE_HOST' , {roomId : streamData._id}) ;
  }
  useEffect(() => {
    AddHost() ;
  } , [isLive])

  useEffect(() => {
    let func = async() => {
      await ensureSocketReady(socket);
      socket.emit('CHECK_AND_UPDATE_LIVE_HOST' , {roomId : 'temp'} , (res) => {
        console.log('available' , res);
        if(res.isAvailableTime){
          setIsRoomAvailable(true) ; 
          setisRoomAvailableTime(res.isAvailableTime) ;
          setStreamData({ _id : res.roomId }) ;
        }else {
          setIsRoomAvailable(false) ;
        }}
      )
      setCheckingDissconnectedRoom(false) ;
    }
    func() ;
  } , [socket])

  useEffect(() => {
    if(isRoomAvailable && isRoomAvailableTime){
      let interval = setInterval(() => {
        if(isRoomAvailableTime <= 0){
          clearInterval(interval) ;
          removeLiveHost() ;
        }else {setisRoomAvailableTime(prev => prev - 1000) ; }
      } , 1000)
      timerRef.current = interval ;
    }
    if(isRoomAvailable === false && timerRef.current){
      clearInterval(timerRef.current) ;
    }
  }, [isRoomAvailable] )
  
  return (
    <>
      {!isLive ? (
        <div className="p-6 flex md:flex-row flex-col gap-4  min-h-screen dark:text-white bg-gray-50 dark:bg-black">
      {/* form */}
          <div className="w-full  space-y-3">
            <h1 className="text-2xl font-bold  flex mb-3 ">
              Go Live 
            </h1>
            <span className="text-sm text-gray-400 italic">
              {IsCheckingDissconnectedRoom ? 'Checking for any disconnected live stream...' : isRoomAvailable ? `You have an ongoing live stream. You can rejoin within ${Math.floor(isRoomAvailableTime / 60000)} minutes.` : 'Fill in the details below to start your live stream.'}
            </span>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="custom_Input shadowLight" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() =>setIsCameraOn(true)}
                className={`flex-1 px-5 py-3 rounded-xl font-semibold ${isCameraOn ? 'text-black bg-white hover:bg-slate-200' : 'text-white bg-slate-700 hover:bg-slate-600'}  transition-all shadow-lg`}
              >
                <CameraIcon /> Use Camera
              </button>
              <button
                onClick={() => setIsCameraOn(false)}
                className={`flex-1 px-5 py-3 rounded-xl font-semibold ${!isCameraOn ? 'text-black bg-white hover:bg-slate-200' : 'text-white bg-slate-700 hover:bg-slate-600'}  transition-all shadow-lg`}
              >
                <ScreenShare /> Screen Share
              </button>
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
              <div className="w-full flex justify-center transition gap-2">
                <button 
                onClick={() => setIsRoomAvailable(false)} className={` py-3 items-center flex justify-center  bg-white shadowLight text-black rounded-xl  showdow-lg shadow-red-400/20 hover:bg-red-700 duration-200 ${!isRoomAvailable ? 'w-0 overflow-hidden' : 'w-full'} `}>  
                  Cancel
                </button>
                <button 
                disabled={IsCheckingDissconnectedRoom}
                onClick={goLive} className="px-6 py-3 items-center flex justify-center w-full bg-red-600 text-white rounded-xl  showdow-lg shadow-red-400/20 hover:bg-red-700 duration-200 shadowLight">
                  {IsCheckingDissconnectedRoom ? (
                    <Loader2Icon className="animate-spin" />
                  ) : <>
                    {isRoomAvailable ? 'Rejoin '+ moment.utc(isRoomAvailableTime).format('mm:ss') : '🔴 Go Live'} 
                  </>}
                </button>
              </div>
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
          {isRoomAvailable && (<></>
            // <DialogBox message={'You have an ongoing live stream. Do you want to stop the previous stream ?'} onClose={() => removeLiveHost()} mainFuction={rejoinLiveStream} />
          )}
        </div>
      ) : (
        <WatchLive localStreamRef={localStreamRef} stopBroadcast={stopBroadcast} isProducer={true} streamData={streamData} />
      )}
    </>
  );
}

// title , description , thumbnail , host , startedAt , endedAt , isLive , viewersCount , producers ( videoId , audioId )