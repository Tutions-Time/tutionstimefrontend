// @ts-ignore
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store/store';
import { clearTokens, setTokens } from '../store/slices/authSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 seconds
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config: any) => {
    // Get token from Redux store (client-side only)
    if (typeof window !== 'undefined') {
      const state = store.getState();
      const token = state.auth?.tokens?.accessToken;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (
      error.response?.status === 401 &&
      originalRequest && 
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;
      
      try {
        // Try to refresh the token
        const state = store.getState();
        const refreshToken = state.auth?.tokens?.refreshToken;
        
        if (!refreshToken) {
          // No refresh token, clear auth state and reject
          store.dispatch(clearTokens());
          return Promise.reject(error);
        }
        
        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens in Redux store using the action creator
        store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return axios(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, logout
        store.dispatch(clearTokens());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error setting up request
    return error.message || 'An unexpected error occurred';
  }
};

export default api;