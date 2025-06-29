import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isProfileEdit : false ,
  isDeleteDialog : {
    isOpen : false ,
    postId : null ,
  } ,
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setIsProfileEdit : (state , action) => {
      state.isProfileEdit = action.payload ;
    } ,
    setisDeleteDialog : (state , action) => {
      state.isDeleteDialog = action.payload ;
    }
  },
});

export const { setIsProfileEdit , setisDeleteDialog} = miscSlice.actions;

export default miscSlice;