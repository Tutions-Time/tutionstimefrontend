import api, { handleApiError } from "../lib/api";

/**
 * 🪙 Get current user wallet (balance + role)
 * Works for both Tutor and Student (auto-detected from token)
 */
export const getMyWallet = async () => {
  try {
    const response = await api.get("/wallet/me");
    return response.data.data; // { userId, role, balance }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 📜 Get all wallet transactions (credit/debit history)
 */
export const getMyTransactions = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get("/wallet/transactions", { params });
    return response.data.data; // array of transactions
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 💰 Credit wallet manually (admin/top-up or system)
 * Optional: can be used in future for refunds or bonus rewards.
 */
export const creditWallet = async (payload: {
  amount: number;
  description: string;
  referenceId?: string;
}) => {
  try {
    const response = await api.post("/wallet/credit", payload);
    return response.data.wallet;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 💸 Debit wallet (for internal payments, e.g., booking, subscription)
 * Optional future use for internal balance deductions.
 */
export const debitWallet = async (payload: {
  amount: number;
  description: string;
  referenceId?: string;
}) => {
  try {
    const response = await api.post("/wallet/debit", payload);
    return response.data.wallet;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 🧾 Export wallet statement (future)
 * Use to generate CSV/PDF statements for wallet history
 */
export const exportWalletStatement = async () => {
  try {
    const response = await api.get("/wallet/export", {
      responseType: "blob", // useful for file download
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
