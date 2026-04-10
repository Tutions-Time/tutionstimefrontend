import api, { handleApiError } from "../lib/api";

type CashfreeVerificationPayload = {
  orderId: string;
};

// ----- Regular Class (One-Time Payment) -----
export const convertBookingToRegular = async (bookingId: string) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/convert`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const verifyBookingPayment = async (
  bookingId: string,
  payload: CashfreeVerificationPayload,
) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/payment/verify`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ----- Subscription (Monthly legacy path) -----
export const createSubscriptionCheckout = async (payload: {
  tutorId: string;
  planType: "monthly";
  sessionsPerWeek: number;
  subject: string;
}) => {
  try {
    const response = await api.post("/subscriptions/checkout", payload);
    return response.data;
  } catch (error) {
    return { success: false, message: handleApiError(error) };
  }
};

export const verifySubscriptionPayment = async (
  paymentResponse: CashfreeVerificationPayload,
  meta: {
    tutorId: string;
    planType: "monthly";
    sessionsPerWeek: number;
    subject: string;
  },
) => {
  try {
    const res = await api.post(`/subscriptions/verify`, {
      ...paymentResponse,
      meta,
    });
    return res.data;
  } catch (error) {
    return { success: false, message: handleApiError(error) };
  }
};

// ----- Generic Payment Verification -----
export const verifyGenericPayment = async (
  paymentResponse: CashfreeVerificationPayload,
  meta?: {
    planType?: "regular" | "monthly" | "hourly" | string;
    billingType?: "hourly" | "monthly";
    numberOfClasses?: number;
    regularClassId?: string;
  },
) => {
  try {
    const res = await api.post(`/payments/verify`, {
      orderId: paymentResponse.orderId,
      regularClassId: meta?.regularClassId,
      billingType: meta?.billingType,
      numberOfClasses: meta?.numberOfClasses,
    });
    return res.data;
  } catch (error) {
    return { success: false, message: handleApiError(error) };
  }
};

export const createSubscriptionOrder = async (payload: {
  regularClassId: string;
  billingType: "hourly" | "monthly";
  numberOfClasses: number;
  couponCode?: string;
}) => {
  try {
    const res = await api.post(`/payments/create-subscription-order`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ----- Admin payouts -----
export const getAdminPayouts = async (params?: {
  status?: "created" | "settled";
  from?: string;
  to?: string;
}) => {
  try {
    const res = await api.get(`/payments/admin/payouts`, { params });
    return res.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const settleAdminPayout = async (payoutId: string) => {
  try {
    const res = await api.patch(`/payments/admin/payouts/${payoutId}/settle`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getAdminPaymentHistory = async (params?: {
  status?: "paid" | "failed" | "pending";
  from?: string;
  to?: string;
}) => {
  try {
    const res = await api.get(`/payments/admin/history`, { params });
    return res.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getAdminNotePaymentHistory = async (params?: {
  status?: "paid" | "failed" | "pending";
  from?: string;
  to?: string;
}) => {
  try {
    const res = await api.get(`/payments/admin/note-history`, { params });
    return res.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getAdminAllPaymentHistory = async (params?: {
  from?: string;
  to?: string;
  status?: string;
  type?: "subscription" | "note" | "group" | "payout" | "referral" | "";
  page?: number;
  limit?: number;
  student?: string;
  tutor?: string;
}) => {
  try {
    const res = await api.get(`/payments/admin/all-history`, { params });
    return {
      data: res.data?.data || [],
      pagination: res.data?.pagination || {
        total: 0,
        page: 1,
        limit: params?.limit || 50,
        pages: 1,
      },
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getAdminRevenueTimeseries = async (params?: {
  from?: string;
  to?: string;
}) => {
  try {
    const res = await api.get(`/payments/admin/revenue-timeseries`, { params });
    return res.data?.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getTutorNoteHistory = async (params?: {
  from?: string;
  to?: string;
}) => {
  try {
    const res = await api.get(`/payments/tutor/note-history`, { params });
    return res.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getTutorNoteRevenue = async () => {
  try {
    const res = await api.get(`/payments/tutor/note-revenue`);
    return res.data?.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
