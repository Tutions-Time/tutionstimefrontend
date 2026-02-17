import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { resetTutorKyc } from '../slices/tutorKycSlice';   // ✅ IMPORTANT FIX

// Types
export type User = {
  id: string;
  email: string;
  phone?: string;
  role: 'student' | 'tutor' | 'admin';
  isProfileComplete: boolean;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthState = {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const sendOtpAsync = createAsyncThunk(
  'auth/sendOtp',
  async ({ email, purpose }: { email: string; purpose: 'login' | 'signup' }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/auth/send-otp',
        { email, purpose },
        { timeout: 60000 } // extend timeout for email providers that respond slowly in local
      );
      const data: any = response?.data || {};
      const requestId = data.requestId ?? data.data?.requestId ?? data.reqId ?? null;
      const expiresIn = data.expiresIn ?? data.data?.expiresIn ?? 30;

      // Accept success in local even if 'success' flag is missing/false, as long as requestId is present
      if (requestId) {
        return { requestId, expiresIn };
      }

      // Fallback to 'success' semantics when requestId is not present
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to send OTP');
      }
      return { requestId: data.requestId, expiresIn: data.expiresIn };
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send OTP';
      return rejectWithValue(msg);
    }
  }
);

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (
    { email, otp, requestId }: { email: string; otp: string; requestId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp, requestId, purpose: 'login' });

      // Reset KYC for fresh login (avoids previous user data)
      dispatch(resetTutorKyc());  // ✅ IMPORTANT FIX

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupAsync = createAsyncThunk(
  'auth/signup',
  async (
    { email, otp, requestId, role, referralCode }: { email: string; otp: string; requestId: string; role: 'student' | 'tutor'; referralCode?: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      if (!email || !otp || !requestId || !role) {
        throw new Error('Missing required fields for signup');
      }

      const response = await api.post('/auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        requestId: requestId.trim(),
        purpose: 'signup',
        role,
        referralCode,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }

      // Reset KYC when new account is created
      dispatch(resetTutorKyc());  // ✅ IMPORTANT FIX

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Signup failed');
    }
  }
);

export const adminLoginAsync = createAsyncThunk(
  'auth/adminLogin',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post('/auth/admin-login', { username, password });

      dispatch(resetTutorKyc());  // optional but safe

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Admin login failed');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.tokens?.refreshToken;

      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    } finally {
      // 🔥 ALWAYS CLEAR KYC ON LOGOUT
      dispatch(resetTutorKyc());
    }

    return true;
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setTokens: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
    },
    clearTokens: (state) => {
      state.tokens = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder.addCase(sendOtpAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendOtpAsync.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(sendOtpAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
    });
    builder.addCase(loginAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Signup
    builder.addCase(signupAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
    });
    builder.addCase(signupAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Admin Login
    builder.addCase(adminLoginAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(adminLoginAsync.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
    });
    builder.addCase(adminLoginAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logoutAsync.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setUser, setTokens, clearTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
