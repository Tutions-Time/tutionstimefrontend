import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TutorKycState {
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  aadhaarUrls: string[];
  panUrl: string | null;
}

const initialState: TutorKycState = {
  kycStatus: 'pending',
  aadhaarUrls: [],
  panUrl: null,
};

const tutorKycSlice = createSlice({
  name: 'tutorKyc',
  initialState,
  reducers: {
    setTutorKyc: (
      state,
      action: PayloadAction<{
        kycStatus: TutorKycState['kycStatus'];
        aadhaarUrls: string[];
        panUrl: string | null;
      }>
    ) => {
      state.kycStatus = action.payload.kycStatus;
      state.aadhaarUrls = action.payload.aadhaarUrls;
      state.panUrl = action.payload.panUrl;
    },
    resetTutorKyc: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setTutorKyc, resetTutorKyc } = tutorKycSlice.actions;
export default tutorKycSlice.reducer;
