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
  aadhaarUrls: string[];
  panUrl: string | null;
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
  const [sort, setSort] = useState<
    "joined_desc" | "joined_asc" | "rating_desc" | "rating_asc" | "name_asc" | "name_desc"
  >("joined_desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [rows, setRows] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycModal, setKycModal] = useState<{ open: boolean; row?: TutorRow }>({ open: false });

  const getProperImageUrl = (path?: string | null) => {
    if (!path) return "";
    const p = String(path);
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    const cleaned = p
      .replace(/^[A-Za-z]:\\.*?uploads\\/i, "uploads/")
      .replace(/\\/g, "/");
    const base = (process.env.NEXT_PUBLIC_IMAGE_URL || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:5000").replace(/\/$/, "");
    const rel = cleaned.replace(/^\//, "");
    return `${base}/${rel}`;
  };

  // ✅ Fetch tutors from backend
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const res = await getAllTutors({
          page,
          limit,
          q: query,
          kyc,
          status,
          minRating,
          sort,
        });
        if (res.success) {
          setRows(res.data || []);
          setTotal(res.pagination?.total || 0);
          setPages(res.pagination?.pages || 1);
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
  }, [page, limit, query, kyc, status, minRating, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, kyc, status, minRating, sort, limit]);

  const showing = useMemo(() => {
    if (total === 0) return "0";
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `${start}-${end}`;
  }, [page, limit, total]);

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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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

              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="joined_desc">Joined (newest)</option>
                <option value="joined_asc">Joined (oldest)</option>
                <option value="rating_desc">Rating (high → low)</option>
                <option value="rating_asc">Rating (low → high)</option>
                <option value="name_asc">Name (A → Z)</option>
                <option value="name_desc">Name (Z → A)</option>
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="text-muted">
                Showing {showing} of {total}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-md border px-2 text-xs"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </Button>
                <span className="text-xs text-muted">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {loading && (
              <Card className="p-6 rounded-2xl bg-white shadow-sm text-center text-muted">
                Loading tutors...
              </Card>
            )}
            {!loading && rows.length === 0 && (
              <Card className="p-6 rounded-2xl bg-white shadow-sm text-center text-muted">
                No tutors found. Try different filters.
              </Card>
            )}
            {!loading &&
              rows.map((t) => (
                <Card key={t.id} className="p-4 rounded-2xl bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-text">{t.name}</div>
                        <div className="text-xs text-muted">{t.email}</div>
                      </div>
                    </div>
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
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                    <div>Phone</div>
                    <div className="text-text">{t.phone || "-"}</div>
                    <div>Rating</div>
                    <div className="text-text">{t.rating.toFixed(1)}</div>
                    <div>Classes (30d)</div>
                    <div className="text-text">{t.classes30d}</div>
                    <div>Earnings (30d)</div>
                    <div className="text-text">
                      ƒ,1{t.earnings30d.toLocaleString("en-IN")}
                    </div>
                    <div>Status</div>
                    <div className="text-text capitalize">{t.status}</div>
                    <div>Joined</div>
                    <div className="text-text">{new Date(t.joinedAt).toLocaleDateString()}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setKycModal({ open: true, row: t })}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" /> View KYC
                    </Button>
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
                    <Link href={`/dashboard/admin/tutors/${t.id}/journey`}>
                      <Button size="sm">Journey</Button>
                    </Link>
                  </div>
                </Card>
              ))}
          </div>

          {/* Table */}
          <Card className="overflow-x-auto rounded-2xl bg-white shadow-sm hidden md:block">
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
                  {rows.map((t) => (
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
                        <div className="flex items-center gap-3">
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
                          <div className="flex items-center gap-2">
                            {(t.aadhaarUrls || []).slice(0, 2).map((src, i) => (
                              <img key={i} src={getProperImageUrl(src)} alt={`aadhaar-${i}`} className="w-8 h-8 rounded object-cover border" />
                            ))}
                            {t.panUrl && (
                              <img src={getProperImageUrl(t.panUrl)} alt="PAN" className="w-8 h-8 rounded object-cover border" />
                            )}
                          </div>
                        </div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setKycModal({ open: true, row: t })}
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" /> View KYC
                          </Button>
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
                          <Link href={`/dashboard/admin/tutors/${t.id}/journey`}>
                            <Button size="sm">Journey</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
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
    {kycModal.open && kycModal.row && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <Card className="p-6 rounded-2xl bg-white shadow-lg w-[90vw] max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">KYC Documents — {kycModal.row.name}</div>
            <Button variant="outline" size="sm" onClick={() => setKycModal({ open: false })}>Close</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {(kycModal.row.aadhaarUrls || []).map((src, i) => (
              <img key={i} src={getProperImageUrl(src)} alt={`aadhaar-${i}`} className="w-full h-32 rounded object-cover border" />
            ))}
            {kycModal.row.panUrl && (
              <img src={getProperImageUrl(kycModal.row.panUrl)} alt="PAN" className="w-full h-32 rounded object-cover border" />
            )}
          </div>
        </Card>
      </div>
    )}
    </div>
  );
}
