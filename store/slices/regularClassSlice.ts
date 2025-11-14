import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RegularClassState {
  show: boolean;
  tutorId: string | null;
  tutorName: string | null;
  hourlyRate: number | null;
  monthlyRate: number | null;
}

const initialState: RegularClassState = {
  show: false,
  tutorId: null,
  tutorName: null,
  hourlyRate: null,
  monthlyRate: null,
};

export const regularClassSlice = createSlice({
  name: "regularClass",
  initialState,
  reducers: {
    openRegularClassModal: (
      state,
      action: PayloadAction<{
        tutorId: string;
        tutorName: string;
        hourlyRate: number;
        monthlyRate: number;
      }>
    ) => {
      state.show = true;
      state.tutorId = action.payload.tutorId;
      state.tutorName = action.payload.tutorName;
      state.hourlyRate = action.payload.hourlyRate;
      state.monthlyRate = action.payload.monthlyRate;
    },

    closeRegularClassModal: (state) => {
      state.show = false;
      state.tutorId = null;
      state.tutorName = null;
      state.hourlyRate = null;
      state.monthlyRate = null;
    },
  },
});

export const { openRegularClassModal, closeRegularClassModal } = regularClassSlice.actions;

export default regularClassSlice.reducer;
