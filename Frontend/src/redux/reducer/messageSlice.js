import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  byRoom : {} , 
  byUnreadMessage : {} ,
};

const messageSlice = createSlice({
  name : 'messagesBuffer' ,
  initialState ,
  reducers : {
    storeSocketMessage : (state , action) => {
      const {room_id , messages} = action.payload ;
    
      if(!state.byRoom[room_id]) state.byRoom[room_id] = [] ;

      const existingMessage = new Set(state.byRoom[room_id].map(m => m._id)) ;
      
      const filterNew = messages.filter(m => !existingMessage.has(m._id)) ;

      state.byRoom[room_id] = [...state.byRoom[room_id] , ...filterNew] ;
    } ,
    clearSocketMessage : (state , action) => {
      const {room_id} = action.payload ;
      state.byRoom[room_id] = [] ;
    } , 
    clearAllSocketMessage : (state) => {
      state.byRoom = {} ;
    } ,
    setUnreadMessage : (state , action) => {
      const {room_id , message} = action.payload ;
      if(!state.byUnreadMessage[room_id]) state.byUnreadMessage[room_id] = [] ;

      state.byUnreadMessage[room_id] = [...state.byUnreadMessage[room_id] , message] ;
    } ,
    clearUnreadMessage : (state , action) => {
      const room_id = action.payload ;
      if(state.byUnreadMessage[room_id]){
        state.byUnreadMessage[room_id] = [] ;
      }
    } ,
    clearAllUnreadMessage : (state , payload) => {
      const room_id = payload.room_id ;
      if(state.byUnreadMessage[room_id]){
        state.byUnreadMessage[room_id] = [] ;
      }
    }
  }
})

export const { 
  storeSocketMessage , clearSocketMessage , clearAllSocketMessage
  , setUnreadMessage , clearUnreadMessage , clearAllUnreadMessage
} = messageSlice.actions;

export default messageSlice;