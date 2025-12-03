import api, { handleApiError } from "../lib/api";

export const listBatches = async (params?: { subject?: string; level?: string; date?: string }) => {
  try {
    const res = await api.get(`/group-batches/list`, { params });
    return res.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getBatch = async (id: string) => {
  try {
    const res = await api.get(`/group-batches/${id}`);
    return res.data?.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const reserveSeat = async (id: string) => {
  try {
    const res = await api.post(`/group-batches/${id}/join`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const createGroupOrder = async (payload: { batchId: string; reservationId: string }) => {
  try {
    const res = await api.post(`/payments/group/create-order`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const verifyGroupPayment = async (payload: { orderId: string; paymentId: string; signature: string; batchId: string }) => {
  try {
    const res = await api.post(`/payments/group/verify`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

