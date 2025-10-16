import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TutorProfileState {
  name: string;
  email: string;
  phone: string;
  gender: string;
  pincode: string;
  photoUrl: string;

  qualification: string;
  experience: string;
  subjects: string[];
  classLevels: string[];
  teachingMode: string;

  hourlyRate: string;
  monthlyRate: string;
  availableDays: string[];

  bio: string;
  achievements: string;
  certificateUrl: string;
  demoVideoUrl: string;
  isSubmitting: boolean;
}

const initialState: TutorProfileState = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  pincode: "",
  photoUrl: "",
  demoVideoUrl: "",
  qualification: "",
  experience: "",
  subjects: [],
  classLevels: [],
  teachingMode: "",

  hourlyRate: "",
  monthlyRate: "",
  availableDays: [],

  bio: "",
  achievements: "",
  certificateUrl: "",

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
