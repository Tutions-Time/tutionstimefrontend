// @ts-ignore
import axios, { AxiosError, AxiosResponse } from 'axios';
import { store } from '../store/store';
import { clearTokens, setTokens } from '../store/slices/authSlice';
import { toast } from '@/hooks/use-toast';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ✅ FIXED: Removed the global Content-Type header
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  
});

// ✅ Smart Request Interceptor
api.interceptors.request.use(
  (config: any) => {
    // Automatically set correct Content-Type
    // Only add 'application/json' when NOT sending FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Add Authorization token from Redux store (client-side only)
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

// ✅ Response Interceptor (Token Refresh Logic)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const data: any = error.response?.data || {};
    const inactive =
      data.error === 'INACTIVE' ||
      String(data.message || '').toLowerCase().includes('inactive');

    if (inactive && typeof window !== 'undefined') {
      store.dispatch(clearTokens());
      try {
        document.cookie = 'auth=; Max-Age=0; path=/';
      } catch {}
      const data: any = error.response?.data || {};
      toast({
        title: 'Account blocked',
        description: data.message || 'Your account is blocked. Please contact support.',
        variant: 'destructive',
      });
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth?.tokens?.refreshToken;

        if (!refreshToken) {
          store.dispatch(clearTokens());
          return Promise.reject(error);
        }

        // Refresh token request
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return axios(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearTokens());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Standardized API Error Handler
export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export default api;
