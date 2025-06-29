import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs' ;

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

    files.forEach(f => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    })
    
    return formattedResults ;
  } catch (error) {
    console.log(files.length);
    
    if(files) files.forEach(f => fs.unlinkSync(f.path))
      console.log( '---error-- while uploading files to Cloudinary' ,error );
    throw new ErrorHandler('Error uploading files in Cloudinary' , 500)   
  }
}


export const deleteFilesFromCloudinary = async(files =[]) => {
  const promise =  files.map((f) => {
    return cloudinary.uploader.destroy(f.public_id )
  })

  try {
    await Promise.all(promise) ;
  } catch (error) {
    console.log('---error-- while deleting file from the cloudinary' ,error);
    throw new ErrorHandler("Error while deleting files in cloudinary" , 500);
  }
}