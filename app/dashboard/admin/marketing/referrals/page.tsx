"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { listReferralCodes, createReferralCode, updateReferralCode, getReferralSettings, updateReferralSettings } from "@/services/marketingService";

type Referral = any;

export default function AdminReferralsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({ studentRewardAmount: 100, tutorRewardAmount: 100, status: 'active' });
  const [form, setForm] = useState<any>({
    code: "",
    rewardType: "fixed",
    rewardAmount: 100,
    maxUses: 100,
    expiry: "",
    allowedRoles: ["student"],
    status: "active",
    campaign: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const list = await listReferralCodes();
      setItems(list);
      const s = await getReferralSettings();
      if (s) setSettings(s);
    } catch (e: any) {
      toast({ title: e.message || "Failed" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      const payload = { ...form };
      if (!payload.code.trim()) {
        toast({ title: "Code required" });
        return;
      }
      if (payload.expiry) payload.expiry = new Date(payload.expiry).toISOString();
      await createReferralCode(payload);
      toast({ title: "Referral created" });
      setForm({ ...form, code: "" });
      await load();
    } catch (e: any) {
      toast({ title: e.message || "Create failed" });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateReferralCode(id, { status });
      await load();
    } catch (e: any) {
      toast({ title: e.message || "Update failed" });
    }
  };

  const list = useMemo(() => items || [], [items]);

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="admin" />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Referrals" subtitle="Create and manage referral codes" />
        <main className="p-4 lg:p-8">
          <div className="grid grid-cols-1 gap-6 max-w-5xl">
            <Card className="p-6 rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Referral Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input type="number" placeholder="Student Reward" value={settings.studentRewardAmount}
                  onChange={(e) => setSettings({ ...settings, studentRewardAmount: Number(e.target.value) })} />
                <Input type="number" placeholder="Tutor Reward" value={settings.tutorRewardAmount}
                  onChange={(e) => setSettings({ ...settings, tutorRewardAmount: Number(e.target.value) })} />
                <Input type="number" placeholder="Referred User Bonus" value={settings.referredUserBonusAmount ?? 0}
                  onChange={(e) => setSettings({ ...settings, referredUserBonusAmount: Number(e.target.value) })} />
                <select className="border rounded p-2" value={settings.status}
                  onChange={(e) => setSettings({ ...settings, status: e.target.value })}>
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={async () => {
                  try { await updateReferralSettings(settings); toast({ title: 'Settings saved' }); }
                  catch (e: any) { toast({ title: e.message || 'Save failed' }); }
                }}>Save</Button>
              </div>
            </Card>
            <Card className="p-6 rounded-2xl bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                <select className="border rounded p-2" value={form.rewardType} onChange={(e) => setForm({ ...form, rewardType: e.target.value })}>
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percent</option>
                </select>
                <Input type="number" placeholder="Reward Amount" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: Number(e.target.value) })} />
                <Input type="number" placeholder="Max Uses" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} />
                <Input type="date" placeholder="Expiry" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
                <select className="border rounded p-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                </select>
                <Input placeholder="Campaign" value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} />
              </div>
              <div className="mt-4">
                <div className="flex gap-2 flex-wrap">
                  {["student", "tutor"].map((t) => (
                    <button
                      key={t}
                      className={`px-3 py-1 rounded border ${form.allowedRoles.includes(t) ? "bg-primary text-black" : "bg-white"}`}
                      onClick={() => {
                        const set = new Set(form.allowedRoles);
                        if (set.has(t)) set.delete(t); else set.add(t);
                        setForm({ ...form, allowedRoles: Array.from(set) });
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={submit}>Create</Button>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Existing Referrals</h2>
                {loading && <Badge>Loading</Badge>}
              </div>
              <div className="space-y-3">
                {list.map((r: any) => (
                  <div key={r._id} className="flex items-center justify-between border rounded p-3">
                    <div className="flex-1">
                      <div className="font-medium">{r.code}</div>
                      <div className="text-sm text-gray-600">{r.rewardType} {r.rewardAmount}</div>
                      <div className="text-xs text-gray-500">uses {r.usedCount}/{r.maxUses} • roles {r.allowedRoles?.join(", ")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="border rounded p-1" value={r.status} onChange={(e) => updateStatus(r._id, e.target.value)}>
                        <option value="active">active</option>
                        <option value="paused">paused</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
