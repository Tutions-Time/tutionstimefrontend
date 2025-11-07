import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TutorProfileState {
  // ----- Personal -----
  name: string;
  email: string;
  gender: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  photoUrl: string;

  // ----- Academic & Teaching -----
  qualification: string;
  specialization: string;
  experience: string;
  teachingMode: string;

  // ----- Subjects & Filters -----
  subjects: string[];
  classLevels: string[];
  boards: string[];
  exams: string[];
  studentTypes: string[];
  groupSize: string;

  // ----- Rates & Availability -----
  hourlyRate: string;
  monthlyRate: string;
  availability: string[]; // calendar-based

  // ----- About -----
  bio: string;
  achievements: string;

  // ----- Uploads -----
  resumeUrl: string;
  demoVideoUrl: string;

  // ----- Control -----
  isSubmitting: boolean;
}

const initialState: TutorProfileState = {
  // Personal
  name: "",
  email: "",
  gender: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  photoUrl: "",

  // Academic
  qualification: "",
  specialization: "",
  experience: "",
  teachingMode: "",

  // Subjects
  subjects: [],
  classLevels: [],
  boards: [],
  exams: [],
  studentTypes: [],
  groupSize: "",

  // Rates & Availability
  hourlyRate: "",
  monthlyRate: "",
  availability: [],

  // About
  bio: "",
  achievements: "",

  // Uploads
  resumeUrl: "",
  demoVideoUrl: "",

  // Control
  isSubmitting: false,
};

const tutorProfileSlice = createSlice({
  name: "tutorProfile",
  initialState,
  reducers: {
    setField: (
      state,
      action: PayloadAction<{ key: keyof TutorProfileState; value: any }>
    ) => {
      const { key, value } = action.payload;
      (state as any)[key] = value;
    },
    setBulk: (state, action: PayloadAction<Partial<TutorProfileState>>) => {
      Object.assign(state, action.payload);
    },
    startSubmitting: (state) => {
      state.isSubmitting = true;
    },
    stopSubmitting: (state) => {
      state.isSubmitting = false;
    },
    resetTutorProfile: () => initialState,
  },
});

export const {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
  resetTutorProfile,
} = tutorProfileSlice.actions;

export default tutorProfileSlice.reducer;
