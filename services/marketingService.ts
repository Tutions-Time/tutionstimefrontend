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

export const listReferralCodes = async () => {
  try {
    const res = await api.get(`/marketing/referrals`);
    return res.data?.data || [];
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const createReferralCode = async (payload: any) => {
  try {
    const res = await api.post(`/marketing/referrals`, payload);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const updateReferralCode = async (id: string, payload: any) => {
  try {
    const res = await api.put(`/marketing/referrals/${id}`, payload);
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

export const getReferralSettings = async () => {
  try {
    const res = await api.get(`/marketing/referral-settings`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const updateReferralSettings = async (payload: any) => {
  try {
    const res = await api.put(`/marketing/referral-settings`, payload);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const applyReferralSettingsToCodes = async () => {
  try {
    const res = await api.post(`/marketing/referrals/apply-settings`, {});
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const applyReferralSettingsToStudentCodes = async () => {
  try {
    const res = await api.post(`/marketing/referrals/apply-settings/student`, {});
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const applyReferralSettingsToTutorCodes = async () => {
  try {
    const res = await api.post(`/marketing/referrals/apply-settings/tutor`, {});
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};
