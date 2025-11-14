import api, { handleApiError } from "@/lib/api";

export const submitReview = async (bookingId: string, payload: any) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/feedback`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
