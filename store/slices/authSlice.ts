import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

// Types
export type User = {
  id: string;
  phone: string;
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
  async ({ phone, purpose }: { phone: string; purpose: 'login' | 'signup' }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-otp', { phone, purpose });
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to send OTP');
      }
      return {
        requestId: response.data.requestId,
        expiresIn: response.data.expiresIn
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (
    { phone, otp, requestId }: { phone: string; otp: string; requestId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp, requestId, purpose: 'login' });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupAsync = createAsyncThunk(
  'auth/signup',
  async (
    { phone, otp, requestId, role }: { phone: string; otp: string; requestId: string; role: 'student' | 'tutor' },
    { rejectWithValue }
  ) => {
    try {
      if (!phone || !otp || !requestId || !role) {
        throw new Error('Missing required fields for signup');
      }

      const response = await api.post('/auth/verify-otp', {
        phone: phone.trim(),
        otp: otp.trim(),
        requestId: requestId.trim(),
        purpose: 'signup',
        role,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }

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
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/admin-login', { username, password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Admin login failed');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout', 
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.tokens?.refreshToken;
      
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
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
      // Even if logout fails on the server, we clear the local state
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setUser, setTokens, clearTokens, clearError } = authSlice.actions;
export default authSlice.reducer;