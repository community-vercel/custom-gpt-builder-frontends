'use client';

import { configureStore } from '@reduxjs/toolkit';
import flowBuilderReducer from './flowBuilderSlice';

export const store = configureStore({
  reducer: {
    flowBuilder: flowBuilderReducer,
  },
});