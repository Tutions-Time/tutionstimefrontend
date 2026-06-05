import api, { handleApiError } from "../lib/api";

export const listCoupons = async () => {
  try {
    const res = await api.get(`/marketing/coupons`);
    return res.data?.data || [];
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const createCoupon = async (payload: any) => {
  try {
    const res = await api.post(`/marketing/coupons`, payload);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const updateCoupon = async (id: string, payload: any) => {
  try {
    const res = await api.put(`/marketing/coupons/${id}`, payload);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const validateCoupon = async (code: string, type: string, amount: number) => {
  try {
    const res = await api.post(`/marketing/coupons/validate`, { code, type, amount });
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

