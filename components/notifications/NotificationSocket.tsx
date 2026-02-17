"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { incrementUnread, setUnreadCount } from "@/store/slices/notificationSlice";
import { listAdminNotifications, listNotifications } from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";
import { emitNotificationEvent } from "@/hooks/useNotificationRefresh";

const getWsUrl = (token: string) => {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  const wsBase = origin.replace(/^http/i, "ws");
  return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
};

const routeKeys = ["route", "href", "path", "link"] as const;

function resolveToastRoute(notificationData: any) {
  if (!notificationData) return undefined;

  for (const key of routeKeys) {
    if (typeof notificationData?.[key] === "string") {
      return notificationData[key];
    }
  }

  return undefined;
}

function showToastForNotification(data: any) {
  const payload = data ?? {};
  const route = resolveToastRoute(payload);
  const title = payload?.title || "Notification";
  const description = payload?.body || payload?.message || "";
  toast({ title, description, meta: payload.meta, route });
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => ctx.close();
  } catch {}
}

function isAdminProfileUpdate(n: any): boolean {
  if (!n) return false;
  const meta = n.meta || {};
  const text =
    String(n.title || "") +
    " " +
    String(n.body || n.message || "");
  const hasExplicitMeta =
    String(meta?.type || meta?.kind || meta?.action || "")
      .toLowerCase()
      .includes("profile") &&
    (String(meta?.type || "").toLowerCase().includes("update") ||
      String(meta?.action || "").toLowerCase().includes("update") ||
      String(meta?.type || "").toLowerCase().includes("complete") ||
      String(meta?.action || "").toLowerCase().includes("complete"));
  const textMatches = /profile.+(updated|completed|edited|changed|submitted)/i.test(
    text,
  );
  return Boolean(hasExplicitMeta || textMatches);
}

export default function NotificationSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.tokens?.accessToken);
  const role = useAppSelector((s) => s.auth.user?.role);
  const wsRef = useRef<WebSocket | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isReadValue = (n: any) => Boolean(n?.read ?? n?.isRead);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        let items =
          role === "admin"
            ? await listAdminNotifications()
            : await listNotifications();
        if (role === "admin") {
          items = items.filter((n: any) => !isAdminProfileUpdate(n));
        }
        const unread = items.filter((n: any) => !isReadValue(n)).length;
        dispatch(setUnreadCount(unread));
        items.forEach((n: any) => {
          if (n?._id) seenIdsRef.current.add(String(n._id));
        });
      } catch {}
    };
    if (token) loadUnread();
  }, [dispatch, role, token]);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(getWsUrl(token));
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.type === "notification" || msg?.type === "admin_notification") {
          const payload = msg?.data;
          if (!(role === "admin" && isAdminProfileUpdate(payload))) {
            dispatch(incrementUnread(1));
            showToastForNotification(payload);
            playBeep();
            emitNotificationEvent({
              type: msg.type,
              data: payload,
              role: role || undefined,
            });
            if (payload?._id) seenIdsRef.current.add(String(payload._id));
          }
        }
      } catch {}
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [dispatch, token]);

  useEffect(() => {
    if (!token) return;

    const poll = async () => {
      try {
        let items =
          role === "admin"
            ? await listAdminNotifications()
            : await listNotifications();
        if (role === "admin") {
          items = items.filter((n: any) => !isAdminProfileUpdate(n));
        }
        const unread = items.filter((n: any) => !isReadValue(n)).length;
        dispatch(setUnreadCount(unread));

        const fresh = items.filter(
          (n: any) => n?._id && !seenIdsRef.current.has(String(n._id)),
        );
        if (fresh.length) {
          const eventType =
            role === "admin" ? "admin_notification" : "notification";
          fresh.forEach((n: any) => seenIdsRef.current.add(String(n._id)));
          fresh.forEach((n: any) => {
            if (!(role === "admin" && isAdminProfileUpdate(n))) {
              showToastForNotification(n);
              emitNotificationEvent({
                type: eventType,
                data: n,
                role: role || undefined,
              });
            }
          });
          if (!(role === "admin" && fresh.every(isAdminProfileUpdate))) {
            playBeep();
          }
        }
      } catch {}
    };

    pollRef.current = setInterval(poll, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [dispatch, role, token]);

  return null;
}
