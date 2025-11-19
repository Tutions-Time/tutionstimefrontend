import api, { handleApiError } from "@/lib/api";

/**
 * Student → Get Demo Requests sent by Tutors
 * GET /bookings/student
 */
export const getStudentDemoRequests = async () => {
  try {
    const res = await api.get("/bookings/student");
    return res.data; // will contain success + data[]
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Student → Update status of demo request
 * PUT /bookings/:id/status
 */
export const updateStudentDemoRequestStatus = async (
  bookingId: string,
  status: "confirmed" | "cancelled"
) => {
  try {
    const res = await api.patch(`/bookings/${bookingId}/student-status`, { status });
    return res.data; // success + message
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
