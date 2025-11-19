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

      // store timestamp so we know student left the website
      localStorage.setItem("student_left_meeting", Date.now().toString());
    },

    checkReturnForReview: (state) => {
      const left = localStorage.getItem("student_left_meeting");
      if (!left) return;

      const NOW = Date.now();
      const diff = NOW - Number(left);

      // If student was gone for more than 20 seconds, assume meeting happened
      if (diff > 20000) {
        state.shouldShowReview = true;
      }
    },

    closeReviewModal: (state) => {
      state.shouldShowReview = false;
      state.bookingId = null;
      state.tutorId = null;
      state.tutorName = null;
      localStorage.removeItem("student_left_meeting");
    },
  },
});

export const {
  markJoiningDemo,
  checkReturnForReview,
  closeReviewModal,
} = reviewSlice.actions;

export default reviewSlice.reducer;
