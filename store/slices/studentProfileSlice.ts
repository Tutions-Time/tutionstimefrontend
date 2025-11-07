'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// -------- Types --------
export type Track = 'school' | 'college' | 'competitive' | '';
export type DaySlot = { day: number; start: string; end: string };

export interface StudentProfileState {
  // personal
  name: string;
  email: string;
  // kept for backward compatibility, but NOT used in submit (you asked to use altPhone):
  phone: string;
  altPhone: string;
  gender: '' | 'Male' | 'Female' | 'Other';
  genderOther: string;

  // address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;

  // academic (track-based)
  track: Track;

  // school
  board: string;
  boardOther: string;
  classLevel: string;
  classLevelOther: string;
  stream: string;
  streamOther: string;

  // college
  program: string;
  programOther: string;
  discipline: string;
  disciplineOther: string;
  yearSem: string;
  yearSemOther: string;

  // competitive
  exam: string;
  examOther: string;
  targetYear: string;
  targetYearOther: string;

  // subjects
  subjects: string[];
  subjectOther: string;

  // tutor prefs
  tutorGenderPref: '' | 'Male' | 'Female' | 'No Preference' | 'Other';
  tutorGenderOther: string;
  availability: DaySlot[];

  // misc
  goals: string;
  photoUrl?: string;

  // ui
  isSubmitting: boolean;
  lastSavedAt?: string;
}

// -------- Initial State --------
const initialState: StudentProfileState = {
  name: '',
  email: '',
  phone: '',         // legacy (not used)
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

// -------- Slice --------
const studentProfileSlice = createSlice({
  name: 'studentProfile',
  initialState,
  reducers: {
    setField: (
      state,
      action: PayloadAction<{ key: keyof StudentProfileState; value: any }>
    ) => {
      const { key, value } = action.payload;
      // @ts-ignore generic assignment is fine here
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

export const { setField, setBulk, startSubmitting, stopSubmitting, resetProfile } =
  studentProfileSlice.actions;

export default studentProfileSlice.reducer;

// -------- Validation Helper --------
export function validateStudentProfile(p: StudentProfileState) {
  const e: Record<string, string> = {};

  // personal
  if (!p.name.trim()) e.name = 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) e.email = 'Valid email required';

  // address
  if (!p.addressLine1.trim()) e.addressLine1 = 'Address line 1 is required';
  if (!p.city.trim()) e.city = 'City is required';
  if (!p.state.trim()) e.state = 'State is required';
  if (!p.pincode.trim() || p.pincode.trim().length < 6) e.pincode = 'Valid pincode required';

  // gender other
  if (p.gender === 'Other' && !p.genderOther.trim()) e.genderOther = 'Please specify';

  // track
  if (!p.track) e.track = 'Select learning track';

  // track-specific
  if (p.track === 'school') {
    if (!p.board) e.board = 'Select board';
    if (p.board === 'Other' && !p.boardOther.trim()) e.boardOther = 'Please specify board';
    if (!p.classLevel) e.classLevel = 'Select class';
    if (p.classLevel === 'Other' && !p.classLevelOther.trim())
      e.classLevelOther = 'Please specify class';
    if (['Class 11', 'Class 12'].includes(p.classLevel)) {
      if (p.stream === 'Other' && !p.streamOther.trim())
        e.streamOther = 'Please specify stream';
    }
  }

  if (p.track === 'college') {
    if (!p.program) e.program = 'Select program';
    if (p.program === 'Other' && !p.programOther.trim())
      e.programOther = 'Please specify program';
    if (!p.discipline) e.discipline = 'Select discipline';
    if (p.discipline === 'Other' && !p.disciplineOther.trim())
      e.disciplineOther = 'Please specify discipline';
    if (p.yearSem === 'Other' && !p.yearSemOther.trim())
      e.yearSemOther = 'Please specify year/sem';
  }

  if (p.track === 'competitive') {
    if (!p.exam) e.exam = 'Select exam';
    if (p.exam === 'Other' && !p.examOther.trim()) e.examOther = 'Please specify exam';
    if (p.targetYear === 'Other' && !p.targetYearOther.trim())
      e.targetYearOther = 'Please specify target year';
  }

  // subjects
  const hasOther = p.subjects.includes('Other');
  if (!p.subjects.length && !hasOther) e.subjects = 'Pick at least one subject';
  if (hasOther && !p.subjectOther.trim()) e.subjectOther = 'Please enter your subject';

  // tutor prefs
  if (p.tutorGenderPref === 'Other' && !p.tutorGenderOther.trim())
    e.tutorGenderOther = 'Please specify';

  return e;
}
