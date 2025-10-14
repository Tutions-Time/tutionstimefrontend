'use client';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import studentProfileReducer from './slices/studentProfileSlice';
import tutorProfileReducer from "./slices/tutorProfileSlice";

export const store = configureStore({
  reducer: {
    studentProfile: studentProfileReducer,
    tutorProfile: tutorProfileReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;