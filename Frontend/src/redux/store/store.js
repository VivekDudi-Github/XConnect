import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../reducer/authSlice";

import api from '../api/api'

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [api.reducerPath] : api.reducer ,
  },
  middleware : (defaultMiddlewares) => [...defaultMiddlewares() , api.middleware ]
})

export default store;