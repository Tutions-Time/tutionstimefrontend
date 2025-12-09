"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getReferralSettings, updateReferralSettings, applyReferralSettingsToStudentCodes, applyReferralSettingsToTutorCodes } from 
  "@/services/marketingService";

export default function AdminReferralsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<any>({ studentRewardAmount: 100, tutorRewardAmount: 100, status: 'active' });

  const load = async () => {
    try {
      const s = await getReferralSettings();
      if (s) setSettings(s);
    } catch (e: any) {
      toast({ title: e.message || "Failed" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userRole="admin" />
      <Sidebar userRole="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title="Referrals" subtitle="Manage global referral amounts" />
        <main className="p-4 lg:p-8">
          <div className="grid grid-cols-1 gap-6 max-w-xl">
            <Card className="p-6 rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Referral Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted">Student Referral Reward (₹)</label>
                  <Input type="number" value={settings.studentRewardAmount}
                    onChange={(e) => setSettings({ ...settings, studentRewardAmount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm text-muted">Tutor Referral Reward (₹)</label>
                  <Input type="number" value={settings.tutorRewardAmount}
                    onChange={(e) => setSettings({ ...settings, tutorRewardAmount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm text-muted">Status</label>
                  <select className="border rounded p-2 w-full" value={settings.status}
                    onChange={(e) => setSettings({ ...settings, status: e.target.value })}>
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={async () => {
                    try { await applyReferralSettingsToStudentCodes(); toast({ title: 'Applied to student codes' }); }
                    catch (e: any) { toast({ title: e.message || 'Apply failed' }); }
                  }}>Apply Student</Button>
                  <Button variant="outline" onClick={async () => {
                    try { await applyReferralSettingsToTutorCodes(); toast({ title: 'Applied to tutor codes' }); }
                    catch (e: any) { toast({ title: e.message || 'Apply failed' }); }
                  }}>Apply Tutor</Button>
                </div>
                <Button onClick={async () => {
                  try { await updateReferralSettings(settings); toast({ title: 'Settings saved' }); }
                  catch (e: any) { toast({ title: e.message || 'Save failed' }); }
                }}>Save</Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
