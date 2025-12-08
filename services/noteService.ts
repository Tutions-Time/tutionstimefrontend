import api, { handleApiError } from "../lib/api";

export const createNote = async (formData: FormData) => {
  try {
    const res = await api.post("/notes", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getMyNotes = async (page = 1, limit = 10) => {
  try {
    const res = await api.get(`/notes/my`, { params: { page, limit } });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateNote = async (id: string, formData: FormData) => {
  try {
    const res = await api.put(`/notes/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const deleteNote = async (id: string) => {
  try {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const searchNotes = async (params: { q?: string; subject?: string; classLevel?: string; board?: string; page?: number; limit?: number }) => {
  try {
    const res = await api.get(`/notes/search`, { params });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getPurchasedNotes = async () => {
  try {
    const res = await api.get(`/notes/purchased`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getDownloadUrl = async (noteId: string) => {
  try {
    const res = await api.get(`/notes/${noteId}/download-url`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const createNoteOrder = async (noteId: string, couponCode?: string) => {
  try {
    const res = await api.post(`/payments/notes/create-order`, { noteId, couponCode });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const verifyNotePayment = async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }, noteId: string) => {
  try {
    const res = await api.post(`/payments/verify`, {
      orderId: payload.razorpay_order_id,
      paymentId: payload.razorpay_payment_id,
      signature: payload.razorpay_signature,
      noteId,
    });
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

