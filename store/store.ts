import { configureStore, combineReducers, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
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
import reviewReducer from './slices/reviewSlice';
import notificationReducer from './slices/notificationSlice';


// ---------- PERSIST CONFIGS ----------
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'tokens', 'isAuthenticated'],
};

const profilePersistConfig = {
  key: 'profile',
  storage,
  whitelist: ['studentProfile', 'tutorProfile'],
};

const kycPersistConfig = {
  key: 'tutorKyc',
  storage,
  whitelist: ['kycStatus', 'aadhaarUrls', 'panUrl', 'bankProofUrl'],
};

const reviewPersistConfig = {
  key: 'review',
  storage,
  whitelist: ['shouldShowReview', 'bookingId', 'tutorId', 'tutorName'],
};


// ---------- ROOT REDUCER ----------
const rootReducer = combineReducers({
  studentProfile: studentProfileReducer,
  tutorProfile: tutorProfileReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  profile: persistReducer(profilePersistConfig, profileReducer),
  availability: availabilityReducer,
  booking: bookingReducer,
  tutorKyc: persistReducer(kycPersistConfig, tutorKycReducer),
  regularClass: regularClassReducer,
  review: persistReducer(reviewPersistConfig, reviewReducer),
  notification: notificationReducer,
});


// ---------- STORE ----------
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);


// ---------- TYPES + CORRECT HOOKS ----------
export type RootState = ReturnType<typeof store.getState>;

// 🔥 Correct dispatch type (supports thunks)
export type AppDispatch = ThunkDispatch<RootState, any, AnyAction>;

// 🔥 Correct hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
