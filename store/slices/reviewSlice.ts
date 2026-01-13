import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReviewState {
  shouldShowReview: boolean;
  bookingId: string | null;
  tutorId: string | null;
  tutorName: string | null;
}

const initialState: ReviewState = {
  shouldShowReview: false,
  bookingId: null,
  tutorId: null,
  tutorName: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    markJoiningDemo: (
      state,
      action: PayloadAction<{
        bookingId: string;
        tutorId: string;
        tutorName: string;
      }>
    ) => {
      state.bookingId = action.payload.bookingId;
      state.tutorId = action.payload.tutorId;
      state.tutorName = action.payload.tutorName;

      localStorage.setItem("active_demo_booking_id", action.payload.bookingId);
    },

    openReviewModal: (
      state,
      action: PayloadAction<{
        bookingId: string;
        tutorId: string;
        tutorName: string;
      }>
    ) => {
      state.bookingId = action.payload.bookingId;
      state.tutorId = action.payload.tutorId;
      state.tutorName = action.payload.tutorName;
      state.shouldShowReview = true;
    },

    closeReviewModal: (state) => {
      state.shouldShowReview = false;
      state.bookingId = null;
      state.tutorId = null;
      state.tutorName = null;
    },
  },
});

export const {
  markJoiningDemo,
  openReviewModal,
  closeReviewModal,
} = reviewSlice.actions;

export default reviewSlice.reducer;
