"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, IndianRupee } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

import {
  searchNotes,
  getPurchasedNotes,
  createNoteOrder,
  verifyNotePayment,
  getDownloadUrl,
} from "@/services/noteService";
import { getStudentRefunds, requestRefund, previewRefund } from "@/services/studentService";
import { Dialog } from "@headlessui/react";

export default function NotesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState("");

  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refundModal, setRefundModal] = useState<{
    open: boolean;
    paymentId: string | null;
    reasonCode: string;
    reasonText: string;
    submitting: boolean;
    preview: any | null;
  }>({ open: false, paymentId: null, reasonCode: "", reasonText: "", submitting: false, preview: null });
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<"purchased" | "all">("purchased");
  const [couponMap, setCouponMap] = useState<Record<string, string>>({});

  // 🛑 Prevent multiple Razorpay popups
  const paymentInProgress = useRef(false);

  const fetchPurchased = async () => {
    try {
      const res = await getPurchasedNotes();
      setPurchased(res.data || []);
      try {
        const rf = await getStudentRefunds();
        setRefunds(rf || []);
      } catch {}
    } catch {}
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await searchNotes({ q, page: 1, limit: 12 });
      setAllNotes(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchased();
    fetchAll();
  }, []);

  const purchasedIds = useMemo(
    () => new Set(purchased.map((p: any) => String(p?.note?._id))),
    [purchased]
  );

  
  const buy = async (note: any) => {
    try {
      if (paymentInProgress.current) return; // 🛑 stop duplicate opens

      const orderRes = await createNoteOrder(String(note._id));

      if (orderRes?.free) {
        toast({ title: "Purchased" });
        fetchPurchased();
        return;
      }

      if ((orderRes as any)?.walletPaid) {
        toast({ title: "Purchased via wallet" });
        if (orderRes?.paymentId) setLastPaymentId(orderRes.paymentId);
        setRefundModal({ open: true, paymentId: orderRes?.paymentId || null, reasonCode: "", reasonText: "", submitting: false, preview: null });
        fetchPurchased();
        return;
      }
      if (!orderRes?.orderId || !(orderRes?.key || orderRes?.razorpayKey)) {
        toast({ title: "Payment init failed", variant: "destructive" });
        return;
      }
      if (orderRes?.paymentId) setLastPaymentId(orderRes.paymentId);

      const ensureRazorpay = async () => {
        if ((window as any).Razorpay) return true;
        return await new Promise<boolean>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(!!(window as any).Razorpay);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const sdkReady = await ensureRazorpay();
      if (!sdkReady) {
        toast({ title: "Razorpay SDK not loaded", variant: "destructive" });
        return;
      }

      const options = {
        key: orderRes.key || orderRes.razorpayKey,
        amount: orderRes.amount,
        currency: "INR",
        name: "TuitionsTime",
        description: "Paid Note",
        order_id: orderRes.orderId,

        modal: {
          ondismiss: () => {
            paymentInProgress.current = false; // reset lock
            toast({ title: "Payment cancelled", variant: "destructive" });
          },
        },

        handler: async (response: any) => {
          const verify = await verifyNotePayment(
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            String(note._id)
          );

          paymentInProgress.current = false; // reset

          if (verify?.success) {
            toast({ title: "Purchased" });
            fetchPurchased();
            setRefundModal({ open: true, paymentId: lastPaymentId, reasonCode: "", reasonText: "", submitting: false, preview: null });
          } else {
            toast({ title: "Verification failed", variant: "destructive" });
          }
        },

        theme: { color: "#207EA9" },
      };

      paymentInProgress.current = true; // lock Razorpay
      const rz = new (window as any).Razorpay(options);

      rz.on("payment.failed", (response: any) => {
        paymentInProgress.current = false;
        const msg = response?.error?.description || "Payment failed";
        toast({ title: msg, variant: "destructive" });
      });

      rz.open();
    } catch {
      paymentInProgress.current = false;
      toast({ title: "Payment failed", variant: "destructive" });
    }
  };

  const download = async (noteId: string) => {
    try {
      const res = await getDownloadUrl(noteId);
      if (res?.url) window.open(res.url, "_blank");
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const submitRefund = async () => {
    if (!refundModal.paymentId || !refundModal.reasonCode) return;
    try {
      setRefundModal((s) => ({ ...s, submitting: true }));
      await requestRefund({ paymentId: refundModal.paymentId, reasonCode: refundModal.reasonCode, reasonText: refundModal.reasonText || undefined });
      toast({ title: "Refund requested" });
      setRefundModal({ open: false, paymentId: null, reasonCode: "", reasonText: "", submitting: false, preview: null });
      const rf = await getStudentRefunds();
      setRefunds(rf || []);
    } catch {
      toast({ title: "Refund request failed", variant: "destructive" });
      setRefundModal((s) => ({ ...s, submitting: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="student"
      />

      <Sidebar
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar title="Notes" subtitle="Search & purchase premium curated notes" />

        <main className="p-4 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-10">

            {/* Search */}
            <div className="p-2 rounded-2xl bg-transparent">
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Search by subject, class, board, title…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-14 flex-1 rounded-2xl bg-white/0 border border-gray-300 shadow-md text-base focus:ring-2 focus:ring-blue-300"
                />

                <Button
                  onClick={fetchAll}
                  className="h-14 px-7 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black text-base font-semibold shadow"
                >
                  <Search className="w-5 h-5" />
                  Search
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center">
              <div className="flex p-2 bg-white/60 backdrop-blur-xl rounded-full border gap-1">
                <button
                  onClick={() => setActiveTab("purchased")}
                  className={`px-8 py-3 text-base font-medium rounded-full ${
                    activeTab === "purchased"
                      ? "bg-white shadow text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  Purchased
                </button>

                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-8 py-3 text-base font-medium rounded-full ${
                    activeTab === "all"
                      ? "bg-white shadow text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  All Notes
                </button>
              </div>
            </div>

            {/* CONTENT */}
            {activeTab === "purchased" ? (
              <>
                <div className="text-xl font-semibold">Purchased Notes</div>

                {purchased.length === 0 && (
                  <Card className="p-6 text-center text-base text-gray-600 bg-white/70 rounded-2xl">
                    No purchased notes yet.
                  </Card>
                )}

                {purchased.map((p: any) => (
                  <Card
                    key={p?.note?._id}
                    className="p-6 bg-white/90 rounded-3xl border shadow flex items-center gap-6"
                  >
                    <div className="w-20 h-20 overflow-hidden border bg-gray-100">
                      <iframe src={p?.note?.pdfUrl} className="w-full h-full" />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-base truncate">
                        {p?.note?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {p?.note?.subject} • {p?.note?.classLevel} • {p?.note?.board}
                      </div>

                      <Badge className="mt-2 bg-blue-50 text-blue-700 text-xs px-2 py-1">
                        Paid ₹{p?.purchase?.amount}
                      </Badge>
                    </div>

                    <Button
                      size="lg"
                      className="text-sm px-5 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700"
                      onClick={() => download(p?.note?._id)}
                    >
                      Download
                    </Button>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">All Notes</div>

                {allNotes.map((n: any) => (
                  <Card
                    key={n._id}
                    className="p-6 bg-white/90 rounded-3xl border shadow flex items-center gap-6"
                  >
                    <div className="w-20 h-20 overflow-hidden border bg-gray-100">
                      <iframe src={n.pdfUrl} className="w-full h-full" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="font-semibold text-base truncate">
                        {n.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {n.subject} • {n.classLevel} • {n.board}
                      </div>

                      <div className="text-base font-semibold flex items-center gap-1 mt-1 text-blue-700">
                        <IndianRupee className="w-4 h-4" />
                        {n.price}
                      </div>
                    </div>

                    {purchasedIds.has(String(n._id)) ? (
                      <Button
                        size="lg"
                        className="text-sm px-5 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700"
                        onClick={() => download(n._id)}
                      >
                        Download
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Coupon UI disabled */}
                        <Button
                        size="lg"
                        className="text-sm px-5 py-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 font-medium"
                        onClick={() => buy(n)}
                      >
                          Buy Now
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </>
            )}
            <div className="mt-10 space-y-3">
              <div className="text-xl font-semibold">My Refund Requests</div>
              <Card className="p-6 bg-white/90 rounded-3xl border shadow">
                {!refunds?.length ? (
                  <div className="text-sm text-gray-600">No refund requests</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted">
                          <th className="p-2">Amount</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Reason</th>
                          <th className="p-2">Course</th>
                          <th className="p-2">Tutor</th>
                          <th className="p-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {refunds.map((x: any) => (
                          <tr key={x._id} className="border-t">
                            <td className="p-2">₹{x.amount}</td>
                            <td className="p-2 capitalize">{x.status}</td>
                            <td className="p-2">{x.reason || ""}</td>
                            <td className="p-2">{x.courseLabel || "—"}</td>
                            <td className="p-2">{x.tutorName || "—"}</td>
                            <td className="p-2">{new Date(x.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={refundModal.open} onClose={() => setRefundModal({ open: false, paymentId: null, reasonCode: "", reasonText: "", submitting: false, preview: null })} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <Dialog.Title className="text-lg font-semibold">Request Refund</Dialog.Title>
              <div className="space-y-3">
                <select
                  value={refundModal.reasonCode || ""}
                  onChange={async (e) => {
                    const code = e.target.value;
                    const next = { ...refundModal, reasonCode: code };
                    setRefundModal(next as any);
                    if (refundModal.paymentId && code) {
                      try {
                        const pv = await previewRefund({ paymentId: refundModal.paymentId, reasonCode: code, reasonText: next.reasonText || undefined });
                        setRefundModal((s: any) => ({ ...s, preview: pv }));
                      } catch {}
                    }
                  }}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="" disabled>Select reason</option>
                  <option value="CLASS_NOT_CONDUCTED">Class not conducted</option>
                  <option value="TUTOR_ABSENT_OR_LATE">Tutor absent or late</option>
                  <option value="WRONG_PURCHASE">Wrong purchase</option>
                  <option value="QUALITY_ISSUE">Quality issue</option>
                  <option value="TECHNICAL_ISSUE">Technical issue</option>
                  <option value="SCHEDULE_CONFLICT">Schedule conflict</option>
                  <option value="CONTENT_NOT_AS_DESCRIBED">Content not as described</option>
                  <option value="OTHER">Other</option>
                </select>
                {refundModal.reasonCode === "OTHER" && (
                  <textarea
                    value={refundModal.reasonText || ""}
                    onChange={async (e) => {
                      const txt = e.target.value;
                      setRefundModal((s: any) => ({ ...s, reasonText: txt }));
                      if (refundModal.paymentId && refundModal.reasonCode) {
                        try {
                          const pv = await previewRefund({ paymentId: refundModal.paymentId, reasonCode: refundModal.reasonCode, reasonText: txt });
                          setRefundModal((s: any) => ({ ...s, preview: pv }));
                        } catch {}
                      }
                    }}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Explain your reason"
                  />
                )}
                {refundModal.preview && (
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>Completion: {Math.round((refundModal.preview.completionPercentage || 0) * 100)}%</div>
                    <div>Refundable: {Math.round((refundModal.preview.refundablePercentage || 0) * 100)}%</div>
                    <div>Max Amount: ₹{refundModal.preview.maximumRefundableAmount || 0}</div>
                    <div>{refundModal.preview.explanation || ""}</div>
                    <div>Window: {refundModal.preview.refundWindowValid ? "Valid" : "Expired"}</div>
                    <div>Method: {refundModal.preview.suggestedRefundMethod}</div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setRefundModal({ open: false, paymentId: null, reasonCode: "", reasonText: "", submitting: false, preview: null })}>Cancel</Button>
                  <Button onClick={submitRefund} disabled={refundModal.submitting || !refundModal.paymentId || !refundModal.reasonCode || (refundModal.reasonCode === "OTHER" && !(refundModal.reasonText || "").trim())}>
                    {refundModal.submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
