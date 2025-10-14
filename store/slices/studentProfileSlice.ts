'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ClassLevel =
  | 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5'
  | 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10'
  | 'Class 11' | 'Class 12' | 'Undergraduate' | 'Other';

export interface StudentProfileState {
  name: string;
  email: string;
  phone: string;
  classLevel: ClassLevel | '';
  subjects: string[];
  goals: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  pincode: string;
  photoUrl?: string; // preview URL or CDN URL when uploaded later
  isSubmitting: boolean;
  lastSavedAt?: string; // ISO timestamp
}

const initialState: StudentProfileState = {
  name: '',
  email: '',
  phone: '',
  classLevel: '',
  subjects: [],
  goals: '',
  gender: '',
  pincode: '',
  photoUrl: undefined,
  isSubmitting: false,
  lastSavedAt: undefined,
};

const studentProfileSlice = createSlice({
  name: 'studentProfile',
  initialState,
  reducers: {
    setField: (
      state,
      action: PayloadAction<{ key: keyof StudentProfileState; value: any }>
    ) => {
      const { key, value } = action.payload;
      // @ts-ignore — allow generic assignment
      state[key] = value;
    },
    setBulk: (state, action: PayloadAction<Partial<StudentProfileState>>) => {
      Object.assign(state, action.payload);
    },
    startSubmitting: (state) => {
      state.isSubmitting = true;
    },
    stopSubmitting: (state) => {
      state.isSubmitting = false;
      state.lastSavedAt = new Date().toISOString();
    },
    resetProfile: () => initialState,
  },
});

export const { setField, setBulk, startSubmitting, stopSubmitting, resetProfile } = studentProfileSlice.actions;
export default studentProfileSlice.reducer;