import {v2 as cloudinary} from 'cloudinary'
import fsSync from 'fs' ;
import fs from 'fs/promises' ;

class ErrorHandler extends Error {
  constructor (message , statusCode){
    super(message) ;
    this.statusCode = statusCode 
  }
}

export const uploadFilesTOCloudinary = async(files =[]) => {
  const promises = files.map((f) => {
    return new Promise((resolve , reject) => {
      cloudinary.uploader.upload(
        f.path ,
        {
          folder : 'XConnect_upload' ,
          use_filename : true ,
          resource_type : "auto"
        } ,
        ( error , result)=> {
          if(error) return reject(error) ;
            resolve(result)
        }
      )
    })
  })

  try {
    const results = await Promise.all(promises) ;

    const formattedResults = results.map((r) => ({
      public_id : r.public_id ,
      url : r.secure_url ,
      type : r.resource_type
    }))

    await Promise.all(files.map( async (f) => {
      if (fsSync.existsSync(f.path)) await fs.unlink(f.path); 
    }))
    
    return formattedResults ;
  } catch (error) {
    console.log(files.length);
    
    if(files) {
      await Promise.all(files.map( async (f) => {
      if (fsSync.existsSync(f.path)) await fs.unlink(f.path); 
    }))
    }
      console.log( '---error-- while uploading files to Cloudinary' ,error );
    throw new ErrorHandler('Error uploading files in Cloudinary' , 500)   
  }
}


export const deleteFilesFromCloudinary = async(files =[]) => {
  const promise =  files.map((f) => {
    if(f?.type === 'video' || !f?.public_id) return ;
    console.log('public_id:' ,f.public_id);
    return cloudinary.uploader.destroy(f.public_id )
  })

  try {
    const awaitedPromise = await Promise.all(promise) ;
    console.log('cloudinary awaitedPromise' , awaitedPromise); 
  } catch (error) {
    console.log('---error-- while deleting file from the cloudinary' ,error);
    throw new ErrorHandler("Error while deleting files in cloudinary" , 500);
  }
}