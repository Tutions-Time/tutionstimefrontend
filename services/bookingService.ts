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


export const startRegularFromDemo = async (
  bookingId: string,
  payload: {
    planType: string;
    billingType: "hourly" | "monthly";
    numberOfClasses?: number;
  }
) => {
  try {
    const response = await api.post(
      `/bookings/${bookingId}/start-regular`,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const getBookingById = async (bookingId: string) => {
  try {
    const res = await api.get(`/bookings/${bookingId}`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const recordDemoJoin = async (bookingId: string) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/demo/join`);
    return res.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const recordDemoEnd = async (bookingId: string) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/demo/end`);
    return res.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};
