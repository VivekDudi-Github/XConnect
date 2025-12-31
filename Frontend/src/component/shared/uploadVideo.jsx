import React, { useEffect, useRef, useState } from 'react'
import {useIntializeVideoUploadMutation , useUploadVideoChunksMutation, useVerifyUploadVideoMutation , useLazyUploadStatusCheckQuery} from '../../redux/api/api'
import {toast} from 'react-toastify'

function UploadVideo() {
  const [isUploading , setUploading] = useState(false) ;
  const [progress , setProgress] = useState(0) ;
  const [fileName , setFileName] = useState('') ;

  const [_id , set_id] = useState(null) ;
  
  const uploadIdRef = useRef(null) ;
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
        const {uploadId , chunkSize} = JSON.parse(localStorage.getItem(fingerprint));
        let uploadStatus = await uploadStatusCheck({uploadId : uploadId}).unwrap();
        console.log(uploadStatus);
        
        const {totalChunks : resTotalChunks , status , chunks} = uploadStatus?.data ;
        console.log(status , resTotalChunks);
        
        totalChunks.current = resTotalChunks ;
        uploadIdRef.current = uploadId ;


        let arr = await createChunk(file.file , totalChunks.current , chunkSize , chunks) ;
        switch(status){
          case 'completed' :
            toast.success('Video has been uploaded successfully.');
            localStorage.removeItem(fingerprint);
            return {uploadId} ;
          case 'failed' :
            toast.error('Video upload failed. Please try again.');
            localStorage.removeItem(fingerprint);
            return ;
          case 'processing' :
            toast.info('Video is being uploaded. Please wait.');
            localStorage.removeItem(fingerprint);
            return {uploadId} ;
          default :
            break; ;
        }


        if( arr.length > 0) await uploadChunks(arr , fingerprint);
        let res = await verifyVideo({uploadId : uploadIdRef.current}).unwrap();

        if(res?.data?.missingChunks?.length > 0){  
          toast.info('Some chunks are missing. Uploading the remaining chunks.');
          arr = await createChunk(file.file , totalChunks.current , chunkSize , chunks , true) ;
          
          await uploadChunks(arr , fingerprint);
          res = await verifyVideo({uploadId : uploadIdRef.current}).unwrap();
          console.log(res);
          
          if(res?.data?.missingChunks?.length > 0) {
            return toast.error('There was an error in uploading the video. Please try again.');
          }
        }

        localStorage.removeItem(fingerprint);
        return {uploadId : uploadIdRef.current };

      }else {
        let res = await inti({ fileSize : file.file.size , fileType : file.type }).unwrap();
        
        if(!res?.data) return toast.error('Couldn\'t initialize the video. Please try again.');
        let chunkSize = res.data.chunkSize ;
        
        set_id(res.data._id);
        uploadIdRef.current = res.data.uploadId ;
        totalChunks.current = res.data.totalChunks ;

        localStorage.setItem(fingerprint , 
            JSON.stringify({
            fingerprint ,
            name : file.file.name , 
            uploadId : uploadIdRef.current ,
            chunkSize : res.data.chunkSize ,
          })
        );


        let arr = await createChunk(file.file , res.data.totalChunks , chunkSize) ;
        if(arr.length > 0) await uploadChunks(arr , fingerprint);
        
        res = await verifyVideo({uploadId : uploadIdRef.current}).unwrap();

        if(res?.data?.missingChunks?.length > 0){  
          toast.info('Some chunks are missing. Uploading the remaining chunks.');
          arr = await createChunk(file.file , totalChunks.current , chunkSize , res.data.missingChunks , true) ;
          
          await uploadChunks(arr , fingerprint);
          res = await verifyVideo({uploadId : uploadIdRef.current}).unwrap();
          
          if(res?.data?.missingChunks?.length > 0) {
            return toast.error('Couldn\'t upload the video. Please try again.');
          }
        }
        localStorage.removeItem(fingerprint);
        return {uploadId : uploadIdRef.current };
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
    console.log(chunkSize ,arr);
    return arr ;
  }

  const uploadChunks = async(chunks ) => {
    if(!chunks.length) return ;

    for(const chunk of chunks){
      const form  = new FormData();
      form.append('chunk' , chunk.blob);
      form.append('uploadId' , uploadIdRef.current);
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