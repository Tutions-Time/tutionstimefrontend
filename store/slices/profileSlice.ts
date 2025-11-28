import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface StudentProfile {
  userId: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  classLevel: string;
  subjects: string[];
  goals: string;
  pincode: string;
  photoUrl?: string;
}

export interface TutorProfile {
  userId: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  pincode: string;
  qualification: string;
  experience: string;
  subjects: string[];
  classLevels: string[];
  teachingMode: string;
  hourlyRate: number;
  monthlyRate?: number;
  availableDays: string[];
  bio: string;
  achievements?: string;
  photoUrl?: string;
  certificateUrl?: string;
  demoVideoUrl?: string;
}

interface ProfileState {
  studentProfile: StudentProfile | null;
  tutorProfile: TutorProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  studentProfile: null,
  tutorProfile: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchUserProfile = createAsyncThunk<
  any,   // 🔥 RETURN TYPE
  void,  // 🔥 ARGUMENT TYPE
  { rejectValue: string } // 🔥 REJECT TYPE
>(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);



export const updateStudentProfile = createAsyncThunk(
  'profile/updateStudent',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/student-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update student profile');
    }
  }
);

export const updateTutorProfile = createAsyncThunk(
  'profile/updateTutor',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/tutor-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tutor profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.studentProfile = null;
      state.tutorProfile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      const data = action.payload?.data || action.payload; // support both shapes
      const role = data?.user?.role;
      const profile = data?.profile || null;

      if (role === 'student') {
        state.studentProfile = profile;
        state.tutorProfile = null;
      } else if (role === 'tutor') {
        state.tutorProfile = profile;
        state.studentProfile = null;
      }
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Student Profile
    builder.addCase(updateStudentProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateStudentProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.studentProfile = action.payload.data;
    });
    builder.addCase(updateStudentProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Tutor Profile
    builder.addCase(updateTutorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTutorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.tutorProfile = action.payload.data;
    });
    builder.addCase(updateTutorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
