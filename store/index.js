import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import flowBuilderReducer from './flowBuilderSlice';
import smtpReducer from './smtpSlice';
import apiConfigReducer from './apiConfigSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    flowBuilder: flowBuilderReducer,
    smtp: smtpReducer,
    apiConfig: apiConfigReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    }),
});