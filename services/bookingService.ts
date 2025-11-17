import api, { handleApiError } from "@/lib/api";

/**
 * Student → Get their bookings
 */
export const getStudentBookings = async () => {
  try {
    const res = await api.get("/bookings/student");
    return res.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Tutor → Book Demo with Student
 */
export const bookStudentDemo = async (payload: {
  studentId: string;
  subject: string;
  date: string;
  time: string;
  note?: string;
}) => {
  try {
    const res = await api.post("/bookings/tutor/demo", payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Fetch logged-in user profile
 * GET /users/profile  (backend resolves to http://localhost:5000/api/users/profile)
 */
export const getUserProfile = async () => {
  try {
    const res = await api.get("/users/profile");
    return res.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
