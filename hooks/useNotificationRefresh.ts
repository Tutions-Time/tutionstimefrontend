import { useEffect } from "react";

export const NOTIFICATION_EVENT = "tutionstime:notification";

export type NotificationEventDetail = {
  type: "notification" | "admin_notification";
  data: any;
  role?: string;
};

export function emitNotificationEvent(detail: NotificationEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail }));
}

export function useNotificationRefresh(
  handler: (detail: NotificationEventDetail) => void,
  filter?: (detail: NotificationEventDetail) => boolean
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const listener = (event: Event) => {
      const detail = (event as CustomEvent<NotificationEventDetail>).detail;
      if (!detail) return;
      if (filter && !filter(detail)) return;
      handler(detail);
    };

    window.addEventListener(NOTIFICATION_EVENT, listener);
    return () => window.removeEventListener(NOTIFICATION_EVENT, listener);
  }, [handler, filter]);
}
