import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../reducer/authSlice";

import api from '../api/api'
import miscSlice from "../reducer/miscSlice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    misc : miscSlice.reducer ,
    [api.reducerPath] : api.reducer ,
  },
  middleware : (defaultMiddlewares) => [...defaultMiddlewares() , api.middleware ]
})

export default store;