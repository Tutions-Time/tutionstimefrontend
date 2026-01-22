import api, { handleApiError } from '../lib/api';

// Send OTP for login/signup
export const sendOtp = async (email: string, purpose: 'login' | 'signup') => {
  try {
    const response = await api.post('/auth/send-otp', { email, purpose });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Verify OTP for login/signup
export const verifyOtp = async (params: {
  email: string;
  otp: string;
  requestId: string;
  purpose: 'login' | 'signup';
  role?: 'student' | 'tutor';
}) => {
  try {
    const response = await api.post('/auth/verify-otp', params);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Admin direct login
export const adminLogin = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/admin-login', { username, password });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Refresh token
export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Logout
export const logout = async (refreshToken: string) => {
  try {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
