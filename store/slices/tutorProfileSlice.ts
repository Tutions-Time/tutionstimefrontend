import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* -------------------------------------------------------
   Tutor Profile Type
------------------------------------------------------- */
export interface TutorProfileState {
  // ----- Personal -----
  name: string;
  email: string;
  phone: string;
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
  availability: string[];
  availableDays: string[];

  // ----- About -----
  bio: string;
  achievements: string;

  // ----- Uploads -----
  resumeUrl: string;
  demoVideoUrl: string;
  certificateUrl: string;

  // ----- Optional UI fields -----
  subjectOther?: string;
  boardsOther?: string;
  subjectsOther?: string;

  // ----- Control -----
  isSubmitting: boolean;
}

/* -------------------------------------------------------
   Initial State
------------------------------------------------------- */
export const initialState: TutorProfileState = {
  // Personal
  name: "",
  email: "",
  phone: "",
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
  availableDays: [],

  // About
  bio: "",
  achievements: "",

  // Uploads
  resumeUrl: "",
  demoVideoUrl: "",
  certificateUrl: "",

  // Optionals
  subjectOther: "",
  boardsOther: "",
  subjectsOther: "",

  // Control
  isSubmitting: false,
};

/* -------------------------------------------------------
   Strongly Typed Reducers
------------------------------------------------------- */
const tutorProfileSlice = createSlice({
  name: "tutorProfile",
  initialState,
  reducers: {
    /* ------------------------------------------
       Strongly Typed setField()
    ------------------------------------------ */
    setField: <K extends keyof TutorProfileState>(
      state: TutorProfileState,
      action: PayloadAction<{ key: K; value: TutorProfileState[K] }>
    ) => {
      const { key, value } = action.payload;
      state[key] = value;
    },

    /* ------------------------------------------
       Bulk Update
    ------------------------------------------ */
    setBulk: (state, action: PayloadAction<Partial<TutorProfileState>>) => {
      Object.assign(state, action.payload);
    },

    /* ------------------------------------------
       Submission status
    ------------------------------------------ */
    startSubmitting: (state) => {
      state.isSubmitting = true;
    },
    stopSubmitting: (state) => {
      state.isSubmitting = false;
    },

    /* ------------------------------------------
       Reset
    ------------------------------------------ */
    resetTutorProfile: () => initialState,
  },
});

/* -------------------------------------------------------
   Exports
------------------------------------------------------- */
export const {
  setField,
  setBulk,
  startSubmitting,
  stopSubmitting,
  resetTutorProfile,
} = tutorProfileSlice.actions;

export default tutorProfileSlice.reducer;
