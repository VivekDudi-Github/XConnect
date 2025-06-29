import React from 'react';
import { useSelector , useDispatch } from 'react-redux';
// import { setIsDialog } from '../../redux/reducer/miscSlice';

const DialogBox = ({ message, onClose , mainFuction }) => {
  const {isDeleteDialog} = useSelector(state => state.misc); 

  
  
  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center duration-200 transition-opacity ${isDeleteDialog ? 'opacity-100' : 'opacity-0 hidden'}`}> 
  
      <div className="dark:bg-black bg-white z-50 text-white rounded-xl p-6 max-w-sm w-full text-center dark:shadow dark:border-none  shadow-slate-500/10 shadow-lg border-t"> 
        <p className="text-gray-800 dark:text-white mb-4 font-semibold">{message}</p>
        <div className='flex gap-4 justify-center'>
          <button
            onClick={onClose}
            className="mt-2 px-2 py-2 border-2 font-semibold bg-white text-slate-500 hover:shadow-md active:scale-95 dark:text-black hover:bg-gray-300 transition duration-200 rounded-xl"  
          >
            Cancel
          </button>
          <button
            onClick={mainFuction}
            className="mt-2 px-2 py-2 border-2 font-semibold bg-white text-slate-500 hover:shadow-md active:scale-95 dark:text-black hover:bg-gray-300 transition duration-200 rounded-xl"
          >
            Confirm
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default DialogBox;
