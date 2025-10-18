"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Search as SearchIcon,
  ToggleLeft,
  ToggleRight,
  Star,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  getAllTutors,
  updateTutorKyc,
  updateTutorStatus,
} from "@/services/adminService";

type Status = "active" | "suspended";
type Kyc = "pending" | "approved" | "rejected";

type TutorRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  kyc: Kyc;
  rating: number;
  classes30d: number;
  earnings30d: number;
  status: Status;
  joinedAt: string;
};

export default function AdminTutorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [kyc, setKyc] = useState<Kyc | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [rows, setRows] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch tutors from backend
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const res = await getAllTutors();
        if (res.success) {
          setRows(res.data);
          toast({ title: "Tutors loaded successfully" });
        } else {
          toast({
            title: "Failed to load tutors",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Error loading tutors",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  // ✅ Filters
  const filtered = useMemo(() => {
    let data = [...rows];
    const q = query.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.phone ?? "").toLowerCase().includes(q)
      );
    }
    if (kyc !== "all") data = data.filter((r) => r.kyc === kyc);
    if (status !== "all") data = data.filter((r) => r.status === status);
    if (minRating > 0) data = data.filter((r) => r.rating >= minRating);
    return data;
  }, [rows, query, kyc, status, minRating]);

  // ✅ Approve/Reject KYC
  async function setKycStatus(id: string, newStatus: Kyc) {
    try {
      await updateTutorKyc(id, newStatus);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, kyc: newStatus } : r))
      );
      toast({
        title: `KYC ${newStatus} successfully ✅`,
      });
    } catch (err: any) {
      if (err.response?.data?.message === "Tutor profile not found") {
        toast({
          title: "Tutor has not submitted KYC yet",
          description: "Cannot verify until tutor uploads documents.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to update KYC",
          description: err.message,
          variant: "destructive",
        });
      }
    }
  }

  // ✅ Activate / Suspend tutor
  async function toggleStatus(id: string, current: Status) {
    try {
      const newStatus = current === "active" ? "suspended" : "active";
      await updateTutorStatus(id, newStatus);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast({
        title: `Tutor ${
          newStatus === "active" ? "activated" : "suspended"
        } successfully ✅`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to update status",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        unreadCount={3}
        userRole="admin"
        userName="Admin"
      />
      <Sidebar
        userRole="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar
          title="Tutors"
          subtitle="KYC, performance, and controls"
          greeting
          action={
            <Link href="/admin/analytics">
              <Button className="bg-primary hover:bg-primary/90 text-text">
                <Users className="w-4 h-4 mr-2" />
                Platform Overview
              </Button>
            </Link>
          }
        />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Filters */}
          <Card className="p-4 rounded-2xl bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <Input
                  placeholder="Search name, email, phone"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={kyc}
                onChange={(e) => setKyc(e.target.value as any)}
              >
                <option value="all">All KYC</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  placeholder="Min rating"
                />
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-muted">
                Loading tutors...
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Tutor</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">KYC</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Classes (30d)</th>
                    <th className="px-4 py-3">Earnings (30d)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-t">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                            {t.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-medium text-text">
                              {t.name}
                            </div>
                            <div className="text-muted text-xs">{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{t.phone ?? "-"}</td>
                      <td className="px-4 py-4">
                        <Badge
                          className={cn(
                            "border capitalize",
                            t.kyc === "approved"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : t.kyc === "pending"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : "bg-red-100 text-red-700 border-red-300"
                          )}
                        >
                          {t.kyc}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">{t.rating.toFixed(1)}</td>
                      <td className="px-4 py-4">{t.classes30d}</td>
                      <td className="px-4 py-4">
                        ₹{t.earnings30d.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={cn(
                            "border",
                            t.status === "active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-red-100 text-red-700 border-red-300"
                          )}
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {new Date(t.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {/* <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              alert(
                                `Open KYC drawer for ${t.name}\n(Attach actual document viewer later)`
                              )
                            }
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" /> View KYC
                          </Button> */}
                          {t.kyc !== "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.confirm(`Approve KYC for ${t.name}?`) &&
                                setKycStatus(t.id, "approved")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </Button>
                          )}
                          {t.kyc !== "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt(
                                  `Reject KYC for ${t.name}. Enter reason:`
                                );
                                if (reason !== null)
                                  setKycStatus(t.id, "rejected");
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.confirm(`Toggle status for ${t.name}?`) &&
                              toggleStatus(t.id, t.status)
                            }
                          >
                            {t.status === "active" ? (
                              <ToggleLeft className="w-4 h-4 mr-2" />
                            ) : (
                              <ToggleRight className="w-4 h-4 mr-2" />
                            )}
                            {t.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-muted"
                      >
                        No tutors found. Try different filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
