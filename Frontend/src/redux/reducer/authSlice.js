import {createSlice} from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  user : null ,
  isAuthLoading : true ,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isAuthLoading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isAuthLoading = false;
    },
    updateUser : (state, action) => {
      if (state.user) {
        state.user = {
          ...action.payload,
        };
      }
    }
  }
});

export default authSlice;
export const { login, logout , updateUser } = authSlice.actions;

