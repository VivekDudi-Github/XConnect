import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isProfileEdit : false ,
  isDeleteDialog : {
    isOpen : false ,
    postId : null ,
  } ,
  chatName : {
    username : null,
    fullname : null,
    _id : null ,
    profilePic : null,
  }
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
    } , 
    setChatName : (state , action) => {
      state.chatName = action.payload ;
    } ,
    emptyChatName : (state ,action ) =>{
      state.chatName = {
        username : null,
        fullname : null,
        _id : null ,
        profilePic : null,
      }
    }
  },
});

export const { setIsProfileEdit , setisDeleteDialog , setChatName , emptyChatName} = miscSlice.actions;

export default miscSlice;