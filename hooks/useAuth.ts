import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store/store";
import { useRouter } from "next/navigation";
import { RootState } from "../store/store";
import {
  sendOtpAsync,
  loginAsync,
  signupAsync,
  adminLoginAsync,
  logoutAsync,
  clearError,
  setUser,
} from "../store/slices/authSlice";
import { resetProfile } from "../store/slices/studentProfileSlice";
import { resetTutorProfile } from "../store/slices/tutorProfileSlice";
import api from "../lib/api";

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
        if (isAuthenticated && tokens?.accessToken && !user) {
          const response = await api.get("/auth/me");
          dispatch(setUser(response.data.user));
          try {
            const cookiePayload = {
              role: response.data.user.role,
              isProfileComplete: response.data.user.isProfileComplete,
            };
            document.cookie = `auth=${encodeURIComponent(
              JSON.stringify(cookiePayload)
            )}; path=/; max-age=2592000`;
          } catch {}
        }
      } catch (error: any) {
        console.error("Auth check error:", error);
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
    async (email: string, purpose: "login" | "signup") => {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await dispatch(sendOtpAsync({ email: normalizedEmail, purpose }));

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
    async (email: string, otp: string, requestId: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await dispatch(loginAsync({ email: normalizedEmail, otp, requestId }));

      if (loginAsync.fulfilled.match(result)) {
        const { user } = result.payload;

        // Set auth cookie for middleware-based route protection
        try {
          const cookiePayload = {
            role: user.role,
            isProfileComplete: user.isProfileComplete,
          };
          document.cookie = `auth=${encodeURIComponent(
            JSON.stringify(cookiePayload)
          )}; path=/; max-age=2592000`; // 30 days
        } catch {}

        // Reset any existing profile data
        if (user.role === "student") {
          dispatch(resetProfile());
        } else if (user.role === "tutor") {
          dispatch(resetTutorProfile());
        }

        // Handle redirection based on role and profile completion
        if (!user.isProfileComplete) {
          // Redirect to role-specific profile completion page
          if (user.role === "student") {
            router.push("/dashboard/student/profile/complete");
          } else if (user.role === "tutor") {
            router.push("/dashboard/tutor/profile/complete");
          }
        } else {
          // Redirect to role-specific dashboard
          if (user.role === "student") {
            router.push("/dashboard/student");
          } else if (user.role === "tutor") {
            router.push("/dashboard/tutor");
          } else if (user.role === "admin") {
            router.push("/dashboard/admin");
          }
        }

        try {
          const token = typeof window !== "undefined" ? (localStorage.getItem("push_token") || "") : "";
          if (token) {
            const { registerDeviceToken } = await import("../services/notificationService");
            await registerDeviceToken(token, "web", undefined, { ua: navigator.userAgent });
          }
        } catch {}

        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, router]
  );

  // Signup
  const signup = useCallback(
    async (
      email: string,
      otp: string,
      requestId: string,
      role: "student" | "tutor",
      referralCode?: string
    ) => {
      // Reset any existing profile data
      if (role === "student") {
        dispatch(resetProfile());
      } else {
        dispatch(resetTutorProfile());
      }

      const normalizedEmail = email.trim().toLowerCase();
      const result = await dispatch(
        signupAsync({ email: normalizedEmail, otp, requestId, role, referralCode })
      );

      if (signupAsync.fulfilled.match(result)) {
        // Set minimal auth cookie; profile not complete yet
        try {
          const cookiePayload = {
            role,
            isProfileComplete: false,
          };
          document.cookie = `auth=${encodeURIComponent(
            JSON.stringify(cookiePayload)
          )}; path=/; max-age=2592000`;
        } catch {}

        // After signup, always redirect to role-specific profile completion
        if (role === "student") {
          router.push("/dashboard/student/profile/complete");
        } else if (role === "tutor") {
          router.push("/dashboard/tutor/profile/complete");
        }
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, router]
  );


  const adminLogin = useCallback(
    async (username: string, password: string) => {
      const result = await dispatch(adminLoginAsync({ username, password }));

      if (adminLoginAsync.fulfilled.match(result)) {
        const { user } = result.payload;

        // ✅ Set auth cookie (for middleware protection)
        try {
          const cookiePayload = {
            role: user.role || "admin",
            isProfileComplete: true,
          };
          document.cookie = `auth=${encodeURIComponent(
            JSON.stringify(cookiePayload)
          )}; path=/; max-age=2592000`; // 30 days
        } catch {}

        // ✅ Persist user state (Redux Persist handles tokens automatically)
        dispatch(setUser(user));

        // ✅ Redirect to admin dashboard
        router.push("/dashboard/admin");
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
    // Clear auth cookie for middleware
    try {
      document.cookie = "auth=; Max-Age=0; path=/";
    } catch {}
    router.push("/");
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
    clearError: handleClearError,
  };
};
