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

const waitForSocket = async (socket) => {
    return new Promise((resolve , reject) => {
      if (!socket) return reject(new Error('Socket not available'));
      if(socket.connected) {
        resolve();
      }
      const onConnect = () => {
        socket.off('connect_error', onError);
        resolve();
      };

      const onError = (err) => {
        socket.off('connect', onConnect);
        reject(err);
      };

      socket.once('connect', onConnect);
      socket.once('connect_error', onError);
    })
  }

const ensureSocketReady = async(socket) => {
  try {
    await new Promise((resolve, reject) => {
      socket.timeout(2000).emit('ping-check', async (err, response) => {
        if (err) {
          try {
            console.log('Socket not ready, reconnecting...');
            
            await waitForSocket(socket);
            console.log('socket reconnected');
            return resolve();
          } catch (error) {
            return reject(error);
          }
        }
        if (response !== 'pong') return reject(new Error('Unexpected response'));
        resolve();
      });
    });
  } catch (err) {
    console.error('Socket not ready:', err);
    throw err;
  }
}


export {
  deletePostFunc ,
  ensureSocketReady
}