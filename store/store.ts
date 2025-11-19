'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import studentProfileReducer from './slices/studentProfileSlice';
import tutorProfileReducer from './slices/tutorProfileSlice';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import availabilityReducer from './slices/availabilitySlice';
import bookingReducer from './slices/bookingSlice';
import tutorKycReducer from './slices/tutorKycSlice';
import regularClassReducer from "./slices/regularClassSlice";

// ⭐ NEW — Review Slice
import reviewReducer from './slices/reviewSlice';

// ─────────────────────────────────────────────
//    PERSIST CONFIGS
// ─────────────────────────────────────────────

// Auth persist (tokens + user session)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'tokens', 'isAuthenticated'],
};

// Profile persist
const profilePersistConfig = {
  key: 'profile',
  storage,
  whitelist: ['studentProfile', 'tutorProfile'],
};

// Tutor KYC persist
const kycPersistConfig = {
  key: 'tutorKyc',
  storage,
  whitelist: ['kycStatus', 'aadhaarUrls', 'panUrl', 'bankProofUrl'],
};

// Review persist (so modal still shows after refresh)
const reviewPersistConfig = {
  key: 'review',
  storage,
  whitelist: ['shouldShowReview', 'bookingId', 'tutorId', 'tutorName'],
};

// ─────────────────────────────────────────────
//    ROOT REDUCER
// ─────────────────────────────────────────────

const rootReducer = combineReducers({
  studentProfile: studentProfileReducer,
  tutorProfile: tutorProfileReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  profile: persistReducer(profilePersistConfig, profileReducer),
  availability: availabilityReducer,
  booking: bookingReducer,
  tutorKyc: persistReducer(kycPersistConfig, tutorKycReducer),
   regularClass: regularClassReducer,

  // ⭐ Added the persisted Review reducer
  review: persistReducer(reviewPersistConfig, reviewReducer),
});

// ─────────────────────────────────────────────
//    STORE CONFIG
// ─────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor instance
export const persistor = persistStore(store);

// ─────────────────────────────────────────────
//    TYPES + CUSTOM HOOKS
// ─────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
