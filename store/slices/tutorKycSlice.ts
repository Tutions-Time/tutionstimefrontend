import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TutorKycState {
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected' | 'under_review';
  payoutDetailsStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  kycDocumentsStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  aadhaarUrls: string[];
  panUrl: string | null;
  upiId: string;
  accountHolderName: string;
  bankAccountNumber: string;
  ifsc: string;
  kycRejectionReason: string;
}

const initialState: TutorKycState = {
  kycStatus: 'pending',
  payoutDetailsStatus: 'pending',
  kycDocumentsStatus: 'pending',
  aadhaarUrls: [],
  panUrl: null,
  upiId: '',
  accountHolderName: '',
  bankAccountNumber: '',
  ifsc: '',
  kycRejectionReason: '',
};

const tutorKycSlice = createSlice({
  name: 'tutorKyc',
  initialState,
  reducers: {
    setTutorKyc: (
      state,
      action: PayloadAction<{
        kycStatus: TutorKycState['kycStatus'];
        payoutDetailsStatus?: TutorKycState['payoutDetailsStatus'];
        kycDocumentsStatus?: TutorKycState['kycDocumentsStatus'];
        aadhaarUrls: string[];
        panUrl: string | null;
        upiId?: string;
        accountHolderName?: string;
        bankAccountNumber?: string;
        ifsc?: string;
        kycRejectionReason?: string;
      }>
    ) => {
      state.kycStatus = action.payload.kycStatus;
      state.payoutDetailsStatus = action.payload.payoutDetailsStatus || 'pending';
      state.kycDocumentsStatus = action.payload.kycDocumentsStatus || 'pending';
      state.aadhaarUrls = action.payload.aadhaarUrls;
      state.panUrl = action.payload.panUrl;
      state.upiId = action.payload.upiId || '';
      state.accountHolderName = action.payload.accountHolderName || '';
      state.bankAccountNumber = action.payload.bankAccountNumber || '';
      state.ifsc = action.payload.ifsc || '';
      state.kycRejectionReason = action.payload.kycRejectionReason || '';
    },

    resetTutorKyc: () => initialState,
  },
});

export const { setTutorKyc, resetTutorKyc } = tutorKycSlice.actions;
export default tutorKycSlice.reducer;
