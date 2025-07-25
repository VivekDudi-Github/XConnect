import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../reducer/authSlice";

import api from '../api/api'
import miscSlice from "../reducer/miscSlice";
import notificationSlice from "../reducer/notificationSlice";
import messagesBuffer from '../reducer/messageSlice' ;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    misc : miscSlice.reducer ,
    notification : notificationSlice.reducer ,
    messagesBuffer : messagesBuffer.reducer ,
    [api.reducerPath] : api.reducer ,
  },
  middleware : (defaultMiddlewares) => [...defaultMiddlewares() , api.middleware ]
})

export default store;