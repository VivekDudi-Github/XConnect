import { toast } from 'react-toastify'
import { setisDeleteDialog } from '../../redux/reducer/miscSlice';



const deletePostFunc = async(id , deleteMutation , dispatch ) => {
  const toastId = toast.loading('Deleting post..');
  try {
    const data = await deleteMutation(id).unwrap() ;
    if(data.success){
      toast.update(toastId, {render : "Post deleted successfully!" , type : 'success' , isLoading : false , autoClose: 5000 , hideProgressBar: false })
    } 
  } catch (error) {
    console.log(error , 'errror in deleting the post');
    toast.update(toastId, {render : "Couldn't delete the post. Please try again." , type : 'error' , isLoading : false ,  autoClose: 5000 , hideProgressBar: false   })
  } finally{
    dispatch(setisDeleteDialog({isOpen : false , postId : null}))
  }
}

export {
  deletePostFunc ,
}