import { configureStore } from "@reduxjs/toolkit"
import configReducer from "./slices/configSlice"
import userReducer from "./slices/userSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    config: configReducer,
  },
})
