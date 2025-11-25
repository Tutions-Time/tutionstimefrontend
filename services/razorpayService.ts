import api, { handleApiError } from "../lib/api";

// ----- Regular Class (One-Time Payment) -----
export const convertBookingToRegular = async (bookingId: string) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/convert`);
    return res.data; // { success, order, data }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const verifyBookingPayment = async (
  bookingId: string,
  payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
) => {
  try {
    const res = await api.post(`/bookings/${bookingId}/payment/verify`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ----- Subscription (Monthly) -----
// STEP 1: create Razorpay order only
export const createSubscriptionCheckout = async (payload: {
  tutorId: string;
  planType: "monthly";
  sessionsPerWeek: number;
  subject: string;
}) => {
  try {
    const response = await api.post("/subscriptions/checkout", payload);
    // Expecting: { success, order, meta }
    return response.data;
  } catch (error) {
    return { success: false, message: handleApiError(error) };
  }
};

// STEP 2: after payment success, verify and create+activate subscription
export const verifySubscriptionPayment = async (
  razorpayResponse: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  meta: {
    tutorId: string;
    planType: "monthly";
    sessionsPerWeek: number;
    subject: string;
  }
) => {
  try {
    const res = await api.post(`/subscriptions/verify`, {
      ...razorpayResponse,
      meta,
    });
    return res.data; // { success, subscription, ... }
  } catch (error) {
    return { success: false, message: handleApiError(error) };
  }
};

// ----- Generic Payment Verification -----
// Use for client-side Razorpay payment verification that updates DB payment status
// Backend: POST /payments/verify
export const verifyGenericPayment = async (
  razorpayResponse: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
  meta?: {
    planType?: "regular" | "monthly" | "hourly" | string;
    billingType?: "hourly" | "monthly";
    numberOfClasses?: number;
    regularClassId?: string;
  }
) => {
  try {
    const res = await api.post(`/payments/verify`, {
      // Backend expects generic names: orderId, paymentId, signature
      orderId: razorpayResponse.razorpay_order_id,
      paymentId: razorpayResponse.razorpay_payment_id,
      signature: razorpayResponse.razorpay_signature,
      regularClassId: meta?.regularClassId,
      billingType: meta?.billingType,
      numberOfClasses: meta?.numberOfClasses,
    });
    return res.data; // { success, ... }
  } catch (error) {
    return { success: false, message: handleApiError(error) };
  }
};

// ----- Admin payouts -----
export const getAdminPayouts = async (params?: { status?: 'created' | 'settled'; from?: string; to?: string }) => {
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

// Admin: payment history (student → admin subscription payments)
export const getAdminPaymentHistory = async (params?: { status?: 'paid' | 'failed' | 'pending'; from?: string; to?: string }) => {
  try {
    const res = await api.get(`/payments/admin/history`, { params });
    return res.data?.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
