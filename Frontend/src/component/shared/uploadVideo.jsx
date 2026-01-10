import React, { useEffect, useRef, useState } from 'react'
import {useIntializeVideoUploadMutation , useUploadVideoChunksMutation, useVerifyUploadVideoMutation , useLazyUploadStatusCheckQuery} from '../../redux/api/api'
import {toast} from 'react-toastify'

function UploadVideo() {
  const [isUploading , setUploading] = useState(false) ;
  const [progress , setProgress] = useState(0) ;
  const [fileName , setFileName] = useState('') ;

  const [_id , set_id] = useState(null) ;
  
  const public_idRef = useRef(null) ;
  const totalChunks = useRef(null) ;
  
  const [chunkIdx , setChunkIdx] = useState(null) ;


  const [inti] = useIntializeVideoUploadMutation();
  const [uploadChunk] = useUploadVideoChunksMutation();
  const [verifyVideo] = useVerifyUploadVideoMutation();

  const [uploadStatusCheck] = useLazyUploadStatusCheckQuery();
 
  const InitUpload = async(file) => {
    setUploading(true);
    console.log(file?.file);
    
    if(!file) return toast.error('Please select a file to upload.');
    try {
      let fingerprint = `activeUpload:${file?.file?.name}-${file?.file?.size}-${file?.file?.lastModified}` ;  
      setFileName(file?.file?.name);

      if(localStorage.getItem(fingerprint)){
        // fetch the last save of the upload
        const {public_id , chunkSize} = JSON.parse(localStorage.getItem(fingerprint));
        let uploadStatus = await uploadStatusCheck({public_id : public_id}).unwrap();
        console.log(uploadStatus);
        
        // set the states and refs
        const {totalChunks : resTotalChunks , status , chunks} = uploadStatus?.data ;
        totalChunks.current = resTotalChunks ;
        public_idRef.current = public_id ;
        //console.log(status , resTotalChunks);
        

        // create chunks
        let arr = await createChunk(file.file , totalChunks.current , chunkSize , chunks) ;
        
        // in case of completed or failed or processing just verify the video
        switch(status){
          case 'completed' :
            toast.success('Video has been uploaded successfully.');
            localStorage.removeItem(fingerprint);
            return {public_id} ;
          case 'failed' :
            toast.error('Video upload failed. Please try again.');
            localStorage.removeItem(fingerprint);
            return ;
          case 'processing' :
            toast.info('Video is being uploaded. Please wait.');
            localStorage.removeItem(fingerprint);
            return {public_id} ;
          case 'transcoding' :
            localStorage.removeItem(fingerprint);
            return {public_id} ;
          default :
            break; ;
        }

        // resuming for remaining chunks
        if( arr.length > 0) await uploadChunks(arr , fingerprint);
        let res = await verifyVideo({public_id : public_idRef.current}).unwrap();

        // if there are missing chunks
        if(res?.data?.missingChunks?.length > 0){  
          toast.info('Some chunks are missing. Uploading the remaining chunks.');
          arr = await createChunk(file.file , totalChunks.current , chunkSize , chunks , true) ;
          
          // upload the missing chunks and verify
          await uploadChunks(arr , fingerprint);
          res = await verifyVideo({public_id : public_idRef.current}).unwrap();
          console.log(res);
          // still failure ? retry error out
          if(res?.data?.missingChunks?.length > 0) {
            return toast.error('There was an error in uploading the video. Please try again.');
          }
        }
        // upload completed
        localStorage.removeItem(fingerprint);
        return {public_id : public_idRef.current };

      }else {
        // initate the video upload
        let res = await inti({ fileSize : file.file.size , fileType : file.type }).unwrap();
        
        if(!res?.data) return toast.error('Couldn\'t initialize the video. Please try again.');
        let chunkSize = res.data.chunkSize ;
        
        // set the states and refs
        set_id(res.data._id);
        public_idRef.current = res.data.public_id ;
        totalChunks.current = res.data.totalChunks ;

        // save the fingerprint in local storage for resuming in case of net failure
        localStorage.setItem(fingerprint , 
            JSON.stringify({
            fingerprint ,
            name : file.file.name , 
            public_id : public_idRef.current ,
            chunkSize : res.data.chunkSize ,
          })
        );

        // create chunks
        let arr = await createChunk(file.file , res.data.totalChunks , chunkSize) ;
        if(arr.length > 0) await uploadChunks(arr , fingerprint);
        
        // verifying and integrity check
        res = await verifyVideo({public_id : public_idRef.current}).unwrap();

        // if there are missing chunks
        if(res?.data?.missingChunks?.length > 0){
          toast.info('Some chunks are missing. Uploading the remaining chunks.');
          arr = await createChunk(file.file , totalChunks.current , chunkSize , res.data.missingChunks , true) ;
          
          await uploadChunks(arr , fingerprint);
          res = await verifyVideo({public_id : public_idRef.current}).unwrap();
          
          if(res?.data?.missingChunks?.length > 0) {
            return toast.error('Couldn\'t upload the video. Please try again.');
          }
        }
        // upload completed 
        localStorage.removeItem(fingerprint);
        return {public_id : public_idRef.current };
      }

    } catch (error) {
      console.log(error , ' error in intializing the video');
      toast.error(error.data?.message || error?.message || "Couldn't initialize the video. Please try again.");
      return false ;
    }
     finally { setFileName('') ; setUploading(false); setProgress(0) ;}
  }

  const createChunk = async(file , totalparts , chunkSize , ChunksIdxArr = [] , isMissingChunks = false) => { 
    const arr = [] ;
    
    if(isMissingChunks){
      for(let i = 0 ; i < totalparts ; i++){
        if(ChunksIdxArr.includes(i)){
          arr.push({
            index : i,
            blob : file.slice(
              i * chunkSize , 
              Math.min((i+1) * chunkSize , file.size)) 
          });
        }
      }

    }else {
      for(let i = 0 ; i < totalparts ; i++){
        if(!ChunksIdxArr.includes(i)){
          arr.push({
            index : i,
            blob : file.slice(
              i * chunkSize , 
              Math.min((i+1)*chunkSize , file.size)) 
          });
        }
      }
    }
    return arr ;
  }

  const uploadChunks = async(chunks ) => {
    if(!chunks.length) return ;

    for(const chunk of chunks){
      const form  = new FormData();
      form.append('chunk' , chunk.blob);
      form.append('public_id' , public_idRef.current);
      form.append('chunkIdx' , chunk.index);
      try {
        await uploadChunk({form}).unwrap();
        
        setChunkIdx(chunk.index);
        
        setProgress((chunk.index/(totalChunks.current-1))*100);
      } catch (error) {
        console.log('error in uploading the video' ,error , );
        throw new Error(error.data?.message || "Couldn't upload the video. Please try again.");
      }
    }
    
  }

  
  return {isUploading , progress , InitUpload , fileName }
}

export default UploadVideo