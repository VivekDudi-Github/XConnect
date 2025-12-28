import React, { useEffect, useRef, useState } from 'react'
import {useIntializeVideoUploadMutation , useUploadVideoChunksMutation} from '../../redux/api/api'
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

  const InitUpload = async(file) => {
    setUploading(true);
    console.log(file?.file);
    
    if(!file) return toast.error('Please select a file to upload.');
    try {
      let fingerprint = `activeUpload:${file?.file?.name}-${file?.file?.size}-${file?.file?.lastModified}` ;  
      setFileName(file?.file?.name);

      if(localStorage.getItem(fingerprint)){
        const {uploadId , size , _id , chunkSize} = JSON.parse(localStorage.getItem(fingerprint));
        uploadIdRef.current = uploadId ;
        totalChunks.current = Math.ceil(size/chunkSize) ;
        
        set_id(_id);

        let arr = await createChunk(file.file , totalChunks.current , chunkSize) ;
        if(arr.length > 0) await uploadChunks(arr , fingerprint);

        return {uploadId : uploadIdRef.current };

      }else {
        const res = await inti({ fileSize : file.file.size , fileType : file.type }).unwrap();
        
        if(!res?.data) return toast.error('Couldn\'t initialize the video. Please try again.');
        console.log(res);
        
        set_id(res.data._id);
        uploadIdRef.current = res.data.uploadId ;
        totalChunks.current = res.data.totalChunks ;

        localStorage.setItem(fingerprint , 
            JSON.stringify({
            fingerprint ,
            name : file.file.name , 
            uploadId : uploadIdRef.current ,
            size : file.file.size ,
            _id : res.data._id ,
            chunkSize : res.data.chunkSize ,
          })
        );


        let arr = await createChunk(file.file , res.data.totalChunks , res.data.chunkSize) ;
        if(arr.length > 0) await uploadChunks(arr , fingerprint);
        
        return {uploadId : uploadIdRef.current };
      }

    } catch (error) {
      console.log(error , ' error in intializing the video');
      toast.error(error.data?.message || error?.message || "Couldn't initialize the video. Please try again.");
      return false ;
    }
     finally { setFileName('') ; setUploading(false); setProgress(0) ;}
  }

  const createChunk = async(file , totalparts , size) => {
    const arr = [] ;
    let pointer = 0 ;

    for(let i = 0 ; i < totalparts ; i++){
      arr.push({
        index : i,
        blob : file.slice(pointer , Math.min(pointer+size , file.size)) 
      });
      pointer += size ;
    }
    return arr ;
  }

  const uploadChunks = async(chunks , fingerprint) => {
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

    localStorage.removeItem(fingerprint);
  }

  
  return {isUploading , progress , InitUpload , fileName }
}

export default UploadVideo