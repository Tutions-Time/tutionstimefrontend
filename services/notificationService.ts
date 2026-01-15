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

export const listAdminNotifications = async () => {
  try {
    const res = await api.get("/admin/notifications");
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

export const markAdminNotificationRead = async (id: string) => {
  try {
    const res = await api.patch(`/admin/notifications/${id}/read`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const res = await api.patch(`/notifications/read-all`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const markAllAdminNotificationsRead = async () => {
  try {
    const res = await api.patch(`/admin/notifications/read-all`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const deleteNotification = async (id: string) => {
  try {
    const res = await api.delete(`/notifications/${id}`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const deleteAllNotifications = async () => {
  try {
    const res = await api.delete(`/notifications`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const deleteAdminNotification = async (id: string) => {
  try {
    const res = await api.delete(`/admin/notifications/${id}`);
    return res.data?.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const deleteAllAdminNotifications = async () => {
  try {
    const res = await api.delete(`/admin/notifications`);
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

