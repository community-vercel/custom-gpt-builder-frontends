// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import flowBuilderReducer from './flowBuilderSlice';
import smtpReducer from './smtpSlice';
import apiConfigReducer from './apiConfigSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    flowBuilder: flowBuilderReducer,
    smtp: smtpReducer,
    apiConfig: apiConfigReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for non-serializable actions (e.g., next-auth)
    }),
});