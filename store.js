import { configureStore } from '@reduxjs/toolkit'
import {alertReducer} from './src/app/redux/alertSlice'
import {productsReducer} from './src/app/redux/productsSlice'
import {authReducer} from './src/app/redux/authSlice'

export const store = configureStore({
  reducer: {
    alertReducer,
    productsReducer,
    authReducer
  },
})