"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listNotifications, markNotificationRead, getNotificationPreferences, updateNotificationPreferences } from "@/services/notificationService";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<{ email: boolean; push: boolean; inapp: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [list, p] = await Promise.all([listNotifications(), getNotificationPreferences()]);
      setItems(list);
      setPrefs(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePref = async (key: "email" | "push" | "inapp") => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    const updated = await updateNotificationPreferences(next);
    setPrefs(updated);
  };

  const markRead = async (id: string) => {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Topbar title="Notifications" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button variant={prefs?.email ? "default" : "outline"} onClick={() => togglePref("email")}>Email</Button>
            <Button variant={prefs?.push ? "default" : "outline"} onClick={() => togglePref("push")}>Push</Button>
            <Button variant={prefs?.inapp ? "default" : "outline"} onClick={() => togglePref("inapp")}>In-App</Button>
          </div>
          {loading && <div>Loading...</div>}
          {items.map((n) => (
            <Card key={n._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.body}</div>
              </div>
              <div className="flex items-center gap-2">
                {!n.read && <Button size="sm" onClick={() => markRead(n._id)}>Mark read</Button>}
              </div>
            </Card>
          ))}
        </main>
      </div>
    </div>
  );
}
