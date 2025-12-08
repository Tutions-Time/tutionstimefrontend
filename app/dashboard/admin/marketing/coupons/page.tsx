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
import { listCoupons, createCoupon, updateCoupon } from "@/services/marketingService";

type Coupon = any;

export default function AdminCouponsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    code: "",
    type: "percent",
    value: 10,
    applicableTo: ["subscription", "group", "note"],
    minAmount: 0,
    maxRedemptions: 100,
    perUserLimit: 1,
    status: "active",
    validFrom: "",
    validTo: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const list = await listCoupons();
      setItems(list);
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
      if (payload.validFrom) payload.validFrom = new Date(payload.validFrom).toISOString();
      if (payload.validTo) payload.validTo = new Date(payload.validTo).toISOString();
      await createCoupon(payload);
      toast({ title: "Coupon created" });
      setForm({ ...form, code: "" });
      await load();
    } catch (e: any) {
      toast({ title: e.message || "Create failed" });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateCoupon(id, { status });
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
        <Topbar title="Coupons" subtitle="Create and manage discount coupons" />
        <main className="p-4 lg:p-8">
          <div className="grid grid-cols-1 gap-6 max-w-5xl">
            <Card className="p-6 rounded-2xl bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                <select className="border rounded p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
                <Input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
                <Input type="number" placeholder="Min Amount" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} />
                <Input type="number" placeholder="Max Redemptions" value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: Number(e.target.value) })} />
                <Input type="number" placeholder="Per User Limit" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: Number(e.target.value) })} />
                <select className="border rounded p-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                </select>
                <Input type="date" placeholder="Valid From" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
                <Input type="date" placeholder="Valid To" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
              </div>
              <div className="mt-4">
                <div className="flex gap-2 flex-wrap">
                  {["subscription", "group", "note"].map((t) => (
                    <button
                      key={t}
                      className={`px-3 py-1 rounded border ${form.applicableTo.includes(t) ? "bg-primary text-black" : "bg-white"}`}
                      onClick={() => {
                        const set = new Set(form.applicableTo);
                        if (set.has(t)) set.delete(t); else set.add(t);
                        setForm({ ...form, applicableTo: Array.from(set) });
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
                <h2 className="font-semibold">Existing Coupons</h2>
                {loading && <Badge>Loading</Badge>}
              </div>
              <div className="space-y-3">
                {list.map((c: any) => (
                  <div key={c._id} className="flex items-center justify-between border rounded p-3">
                    <div className="flex-1">
                      <div className="font-medium">{c.code}</div>
                      <div className="text-sm text-gray-600">{c.type} {c.value} • {c.applicableTo?.join(", ")}</div>
                      <div className="text-xs text-gray-500">redemptions {c.redemptions}/{c.maxRedemptions} • perUser {c.perUserLimit}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="border rounded p-1" value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)}>
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
