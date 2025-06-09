import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isProfileEdit : false ,
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setIsProfileEdit : (state , action) => {
      state.isProfileEdit = action.payload ;
    }
  },
});

export const { setIsProfileEdit } = miscSlice.actions;

export default miscSlice;