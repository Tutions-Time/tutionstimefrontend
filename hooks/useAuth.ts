import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/store';
import { useRouter } from 'next/navigation';
import { RootState } from '../store/store';
import {
  sendOtpAsync,
  loginAsync,
  signupAsync,
  adminLoginAsync,
  logoutAsync,
  clearError,
  setUser
} from '../store/slices/authSlice';
import { resetProfile } from '../store/slices/studentProfileSlice';
import { resetTutorProfile } from '../store/slices/tutorProfileSlice';
import api from '../lib/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading, error, isAuthenticated, tokens } = useSelector(
    (state: RootState) => state.auth
  );

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only verify if authenticated but user data is missing
        if (isAuthenticated && tokens?.accessToken && !user) {
          // Verify token validity with backend
          const response = await api.get('/users/me');
          dispatch(setUser(response.data.user));
        }
      } catch (error: any) {
        console.error('Auth check error:', error);
        // Only logout on specific error conditions
        if (error.response?.status === 401 || error.response?.status === 403) {
          dispatch(logoutAsync());
        }
      }
    };
    
    checkAuth();
  }, [dispatch, isAuthenticated, tokens, user]);
  
  // Send OTP
  const sendOtp = useCallback(
    async (phone: string, purpose: 'login' | 'signup') => {
      const result = await dispatch(sendOtpAsync({ phone, purpose }));
      
      if (sendOtpAsync.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch]
  );
  
  // Login
  const login = useCallback(
    async (phone: string, otp: string, requestId: string) => {
      const result = await dispatch(loginAsync({ phone, otp, requestId }));
      
      if (loginAsync.fulfilled.match(result)) {
        const { user } = result.payload;
        
        // Reset any existing profile data
        if (user.role === 'student') {
          dispatch(resetProfile());
        } else if (user.role === 'tutor') {
          dispatch(resetTutorProfile());
        }
        
        // Handle redirection based on role and profile completion
        if (!user.isProfileComplete) {
          // Redirect to role-specific profile completion page
          if (user.role === 'student') {
            router.push('/dashboard/student/profile/complete');
          } else if (user.role === 'tutor') {
            router.push('/dashboard/tutor/profile/complete');
          }
        } else {
          // Redirect to role-specific dashboard
          if (user.role === 'student') {
            router.push('/dashboard/student');
          } else if (user.role === 'tutor') {
            router.push('/dashboard/tutor');
          } else if (user.role === 'admin') {
            router.push('/dashboard/admin');
          }
        }
        
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, router]
  );
  
  // Signup
  const signup = useCallback(
    async (phone: string, otp: string, requestId: string, role: 'student' | 'tutor') => {
      // Reset any existing profile data
      if (role === 'student') {
        dispatch(resetProfile());
      } else {
        dispatch(resetTutorProfile());
      }
      
      const result = await dispatch(signupAsync({ phone, otp, requestId, role }));
      
      if (signupAsync.fulfilled.match(result)) {
        // After signup, always redirect to role-specific profile completion
        if (role === 'student') {
          router.push('/dashboard/student/profile/complete');
        } else if (role === 'tutor') {
          router.push('/dashboard/tutor/profile/complete');
        }
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, router]
  );
  
  // Admin Login (direct URL)
  const adminLogin = useCallback(
    async (username: string, password: string) => {
      const result = await dispatch(adminLoginAsync({ username, password }));
      
      if (adminLoginAsync.fulfilled.match(result)) {
        // Redirect to admin dashboard
        router.push('/dashboard/admin');
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, router]
  );
  
  // Logout
  const handleLogout = useCallback(async () => {
    await dispatch(logoutAsync());
    router.push('/login');
  }, [dispatch, router]);
  
  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    sendOtp,
    login,
    signup,
    adminLogin,
    logout: handleLogout,
    clearError: handleClearError
  };
};