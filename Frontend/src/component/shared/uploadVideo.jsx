import React, { useEffect, useState } from 'react'
import {useIntializeVideoUploadMutation , useUploadVideoChunksMutation} from '../../redux/api/api'
import {toast} from 'react-toastify'

function uploadVideo({file}) {
  const [uploading , setUploading] = useState(false) ;
  const [progress , setProgress] = useState(0) ;

  const [_id , set_id] = useState(null) ;
  
  const [uploadId , setUploadId] = useState(null) ;
  const [chunkSize , setChunkSize] = useState(null) ;
  const [totalChunks , setTotalChunks] = useState(null) ;
  
  const [chunkIdx , setChunkIdx] = useState(null) ;
  const [chunks, setChunks] = useState([]) ;
  

  const [inti] = useIntializeVideoUploadMutation();
  const [uploadChunk] = useUploadVideoChunksMutation();

  const InitUpload = async() => {
    setUploading(true);
    if(!file) return toast.error('Please select a file to upload.');
    try {
      const res = await inti({ fileSize : file.size , fileType : file.type }).unwrap();
      console.log(res);
      if(!res.data) return toast.error('Couldn\'t initialize the video. Please try again.');
      
      set_id(res.data._id);
      setUploadId(res.data.uploadId);
      setChunkSize(res.data.chunkSize);
      setTotalChunks(res.data.totalChunks);

      createChunk() ;
      uploadChunks() ;
    } catch (error) {
      console.log(error , ' error in intializing the video');
      toast.error(error.data?.message || "Couldn't initialize the video. Please try again.");
    } finally { setUploading(false);}
  }

  const createChunk = () => {
    const arr = [] ;
    let idx = 0 ;

    for(let i = 0 ; i < file.size ; i+= chunkSize){
      arr.push({
        index : idx,
        blob : file.slice(i , i+chunkSize) 
      });
      idx++ ;
    }
    setChunks(arr);
  }

  const uploadChunks = async() => {
    if(!chunks.length) return ;

    for(const chunk of chunks){
      const form  = new FormData();
      form.append('chunk' , chunk.blob);
      form.append('uploadId' , uploadId);
      form.append('chunkIdx' , chunk.index);
      try {
        const res = await uploadChunk({form}).unwrap();
        if(!res.data) return toast.error("Couldn't upload the video. Please try again.");
        setChunkIdx(chunk.index);
        setProgress(chunk.index/totalChunks);
      } catch (error) {
        console.log(error , 'error in uploading the video');
        toast.error(error.data?.message || "Couldn't upload the video. Please try again.");
      }
    }
  }

  return [uploading , progress , InitUpload , uploadChunks]
}

export default uploadVideo