import api, { handleApiError } from "@/lib/api";

export const getStudentBookings = async () => {
  try {
    const res = await api.get("/bookings/student");
    return res.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
