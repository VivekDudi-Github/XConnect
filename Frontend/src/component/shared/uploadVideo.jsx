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
      setFileName(file.file.name);
      if(sessionStorage.getItem(file.file.name)){
        const {uploadId , size} = JSON.parse(sessionStorage.getItem(file.file.name));


      }else {
         const res = await inti({ fileSize : file.file.size , fileType : file.type }).unwrap();
        
        if(!res?.data) return toast.error('Couldn\'t initialize the video. Please try again.');
        console.log(res);
        
        set_id(res.data._id);
        uploadIdRef.current = res.data.uploadId ; 
        totalChunks.current = res.data.totalChunks ;
        sessionStorage.setItem(file.file.name , {
          uploadId : uploadIdRef.current ,
          size : file.file.size ,
          _id : res.data._id ,
        });
        await createChunk(file.file , res.data.totalChunks , res.data.chunkSize) ;
        
        return {uploadId : uploadIdRef.current };
      }

    } catch (error) {
      console.log(error , ' error in intializing the video');
      toast.error(error.data?.message || "Couldn't initialize the video. Please try again.");
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
    if(arr.length > 0) await uploadChunks(arr);
  }

  const uploadChunks = async(chunks) => {
    if(!chunks.length) return ;

    for(const chunk of chunks){
      console.log(chunk?.index);
      
      const form  = new FormData();
      form.append('chunk' , chunk.blob);
      form.append('uploadId' , uploadIdRef.current);
      form.append('chunkIdx' , chunk.index);
      try {
        const res = await uploadChunk({form}).unwrap();
        if(!res.success) return toast.error('Couldn\'t upload the video. Please try again.');
        setChunkIdx(chunk.index);
        setProgress((chunk.index/(totalChunks.current-1))*100);
      } catch (error) {
        console.log('error in uploading the video' ,error , );
        toast.error(error.data?.message || "Couldn't upload the video. Please try again.");
      }
    }
  }

  return {isUploading , progress , InitUpload , fileName }
}

export default UploadVideo