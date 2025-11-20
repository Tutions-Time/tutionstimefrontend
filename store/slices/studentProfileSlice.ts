'use client';

import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import api from '@/lib/api'; // adjust path if needed

// -------- Types --------
export type Track = 'school' | 'college' | 'competitive' | '';
export type DaySlot = { day: number; start: string; end: string };

export interface UpdateProfileResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface StudentProfileState {
  name: string;
  email: string;
  phone: string;
  altPhone: string;
  gender: '' | 'Male' | 'Female' | 'Other';
  genderOther: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;

  track: Track;

  board: string;
  boardOther: string;
  classLevel: string;
  classLevelOther: string;
  stream: string;
  streamOther: string;

  program: string;
  programOther: string;
  discipline: string;
  disciplineOther: string;
  yearSem: string;
  yearSemOther: string;

  exam: string;
  examOther: string;
  targetYear: string;
  targetYearOther: string;

  subjects: string[];
  subjectOther: string;

  tutorGenderPref: '' | 'Male' | 'Female' | 'No Preference' | 'Other';
  tutorGenderOther: string;
  availability: DaySlot[];

  goals: string;
  photoUrl?: string;

  isSubmitting: boolean;
  lastSavedAt?: string;
}

// -------- Initial State --------
const initialState: StudentProfileState = {
  name: '',
  email: '',
  phone: '',
  altPhone: '',
  gender: '',
  genderOther: '',

  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',

  track: '',

  board: '',
  boardOther: '',
  classLevel: '',
  classLevelOther: '',
  stream: '',
  streamOther: '',

  program: '',
  programOther: '',
  discipline: '',
  disciplineOther: '',
  yearSem: '',
  yearSemOther: '',

  exam: '',
  examOther: '',
  targetYear: '',
  targetYearOther: '',

  subjects: [],
  subjectOther: '',

  tutorGenderPref: 'No Preference',
  tutorGenderOther: '',
  availability: [],

  goals: '',
  photoUrl: undefined,

  isSubmitting: false,
  lastSavedAt: undefined,
};

// ------------------------------------------------------------
// ⭐ THUNK — Update Student Profile (Fixes your TypeScript error)
// ------------------------------------------------------------
export const updateStudentProfileThunk = createAsyncThunk<
  UpdateProfileResponse, // Return Type
  FormData               // Argument Type
>(
  'studentProfile/update',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/student/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return res.data as UpdateProfileResponse;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || {
          success: false,
          message: 'Update failed',
        }
      );
    }
  }
);

// ------------------------------------------------------------
// Slice
// ------------------------------------------------------------
const studentProfileSlice = createSlice({
  name: 'studentProfile',
  initialState,
  reducers: {
    setField: (
      state,
      action: PayloadAction<{ key: keyof StudentProfileState; value: any }>
    ) => {
      const { key, value } = action.payload;
      // @ts-ignore safe assignment
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

  // ------------------------------------------------------------
  // ⭐ EXTRA REDUCERS — Runs when thunk dispatches actions
  // ------------------------------------------------------------
  extraReducers: (builder) => {
    builder
      .addCase(updateStudentProfileThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateStudentProfileThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.lastSavedAt = new Date().toISOString();

        if (action.payload?.data) {
          Object.assign(state, action.payload.data);
        }
      })
      .addCase(updateStudentProfileThunk.rejected, (state) => {
        state.isSubmitting = false;
      });
  },
});

// ---- Export Actions ----
export const {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
  resetProfile,
} = studentProfileSlice.actions;

// ---- Export Reducer ----
export default studentProfileSlice.reducer;

// ------------------------------------------------------------
// Validation helper (unchanged)
// ------------------------------------------------------------
export function validateStudentProfile(p: StudentProfileState) {
  const e: Record<string, string> = {};

  if (!p.name.trim()) e.name = 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
    e.email = 'Valid email required';

  if (!p.addressLine1.trim()) e.addressLine1 = 'Address line 1 is required';
  if (!p.city.trim()) e.city = 'City is required';
  if (!p.state.trim()) e.state = 'State is required';
  if (!p.pincode.trim() || p.pincode.trim().length < 6)
    e.pincode = 'Valid pincode required';

  if (p.gender === 'Other' && !p.genderOther.trim())
    e.genderOther = 'Please specify';

  if (!p.track) e.track = 'Select learning track';

  const hasOther = p.subjects.includes('Other');
  if (!p.subjects.length && !hasOther)
    e.subjects = 'Pick at least one subject';
  if (hasOther && !p.subjectOther.trim())
    e.subjectOther = 'Please enter your subject';

  if (p.tutorGenderPref === 'Other' && !p.tutorGenderOther.trim())
    e.tutorGenderOther = 'Please specify';

  return e;
}
