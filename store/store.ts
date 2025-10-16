'use client';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import studentProfileReducer from './slices/studentProfileSlice';
import tutorProfileReducer from "./slices/tutorProfileSlice";
import authReducer from "./slices/authSlice";
import profileReducer from './slices/profileSlice';

// Configure persist for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'tokens', 'isAuthenticated'] // only persist these fields
};

// Configure persist for profile slice
const profilePersistConfig = {
  key: 'profile',
  storage,
  whitelist: ['studentProfile', 'tutorProfile'] // persist profile data
};

const rootReducer = combineReducers({
  studentProfile: studentProfileReducer, // for form state
  tutorProfile: tutorProfileReducer, // for form state
  auth: persistReducer(authPersistConfig, authReducer),
  profile: persistReducer(profilePersistConfig, profileReducer), // for actual profile data
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;