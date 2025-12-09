import api, { handleApiError } from "../lib/api";

export const registerDeviceToken = async (token: string, platform?: string, provider?: string, meta?: any) => {
  try {
    const res = await api.post("/devices/register", { token, platform, provider, meta });
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const listNotifications = async () => {
  try {
    const res = await api.get("/notifications");
    return res.data?.data || [];
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const markNotificationRead = async (id: string) => {
  try {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const getNotificationPreferences = async () => {
  try {
    const res = await api.get("/notifications/preferences");
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const updateNotificationPreferences = async (prefs: { email?: boolean; push?: boolean; inapp?: boolean }) => {
  try {
    const res = await api.put("/notifications/preferences", prefs);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

