'use client';

import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import api from '@/lib/api';

/* -------------------------------- TYPES -------------------------------- */

export type Track = 'school' | 'college' | 'competitive' | '';

export interface UpdateProfileResponse {
  success: true;
  data?: Partial<StudentProfileState>;
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

  availability: string[];
  preferredTimes: string[];

  goals: string;
  photoUrl?: string;

  learningMode: '' | 'Online' | 'Offline' | 'Both';

  isSubmitting: boolean;
  lastSavedAt?: string;
}

/* ----------------------------- INITIAL STATE ----------------------------- */

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
  preferredTimes: [],

  goals: '',
  photoUrl: undefined,

  learningMode: '',

  isSubmitting: false,
  lastSavedAt: undefined,
};

/* -------------------------------------------------------------------------- */
/* ✅ THUNK — ALWAYS RESOLVES ON SUCCESS                                      */
/* -------------------------------------------------------------------------- */

export const updateStudentProfileThunk = createAsyncThunk<
  UpdateProfileResponse,
  FormData
>(
  'studentProfile/update',
  async (formData) => {
    const res = await api.post('/users/student-profile', formData);

    // 🔥 Normalize success — do NOT depend on backend shape
    return {
      success: true,
      data: res.data?.data ?? res.data,
      message: res.data?.message ?? 'Profile updated',
    };
  }
);

/* -------------------------------------------------------------------------- */
/* SLICE                                                                       */
/* -------------------------------------------------------------------------- */

const studentProfileSlice = createSlice({
  name: 'studentProfile',
  initialState,

  reducers: {
    setField: <
      K extends keyof StudentProfileState
    >(
      state: StudentProfileState,
      action: PayloadAction<{ key: K; value: StudentProfileState[K] }>
    ) => {
      state[action.payload.key] = action.payload.value;
    },

    setBulk: (
      state,
      action: PayloadAction<Partial<StudentProfileState>>
    ) => {
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

  /* ---------------------------- EXTRA REDUCERS ---------------------------- */

  extraReducers: (builder) => {
    builder
      .addCase(updateStudentProfileThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateStudentProfileThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.lastSavedAt = new Date().toISOString();

        if (action.payload.data) {
          Object.assign(state, action.payload.data);
        }
      })
      .addCase(updateStudentProfileThunk.rejected, (state) => {
        state.isSubmitting = false;
      });
  },
});

/* ----------------------------- EXPORT ACTIONS ----------------------------- */

export const {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
  resetProfile,
} = studentProfileSlice.actions;

/* ----------------------------- EXPORT REDUCER ----------------------------- */

export default studentProfileSlice.reducer;

/* -------------------------------------------------------------------------- */
/* VALIDATION HELPER                                                          */
/* -------------------------------------------------------------------------- */

export function validateStudentProfile(p: StudentProfileState) {
  const e: Record<string, string> = {};

  if (!p.name.trim()) e.name = 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
    e.email = 'Valid email required';

  if (!p.addressLine1.trim()) e.addressLine1 = 'Address line 1 is required';
  if (!p.city.trim()) e.city = 'City is required';
  if (!p.state.trim()) e.state = 'State is required';
  if (!p.pincode.trim() || p.pincode.length < 6)
    e.pincode = 'Valid pincode required';

  if (p.gender === 'Other' && !p.genderOther.trim())
    e.genderOther = 'Please specify gender';

  if (!p.track) e.track = 'Select learning track';

  const hasOther = p.subjects.includes('Other');
  if (!p.subjects.length && !hasOther)
    e.subjects = 'Pick at least one subject';
  if (hasOther && !p.subjectOther.trim())
    e.subjectOther = 'Please enter subject';

  if (p.tutorGenderPref === 'Other' && !p.tutorGenderOther.trim())
    e.tutorGenderOther = 'Please specify tutor gender';

  return e;
}
