import api, { handleApiError } from "@/lib/api";

export const requestReschedule = async (sessionId: string, payload: { date: string; time: string; reason?: string }) => {
  try {
    const res = await api.post(`/reschedules/sessions/${sessionId}/requests`, payload);
    return res.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const approveReschedule = async (requestId: string) => {
  try {
    const res = await api.post(`/reschedules/${requestId}/approve`);
    return res.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const rejectReschedule = async (requestId: string) => {
  try {
    const res = await api.post(`/reschedules/${requestId}/reject`);
    return res.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const listMyRescheduleRequests = async () => {
  try {
    const res = await api.get(`/reschedules/mine`);
    return res.data?.data || [];
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

