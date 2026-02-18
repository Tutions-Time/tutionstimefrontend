"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listBatches,
  reserveSeat,
  createGroupOrder,
  verifyGroupPayment,
} from "@/services/groupBatchService";
import { requestRefund, previewRefund } from "@/services/studentService";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import GroupSessionsModal from "@/components/group-batches/GroupSessionsModal";
import { Calendar, Users, IndianRupee, Video } from "lucide-react";
import { useNotificationRefresh } from "@/hooks/useNotificationRefresh";

export default function StudentGroupBatches() {
  const formatTime = (time?: string) => {
    if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return time || "";
    const [h, m] = time.split(":").map(Number);
    const d = new Date(0, 0, 0, h, m);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };
  const [filters, setFilters] = useState<{ subject?: string; level?: string; date?: string }>({});
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Enrollment Modal State
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollBatch, setEnrollBatch] = useState<any>(null);
  const [enrollMonths, setEnrollMonths] = useState(1);
  const [enrollMonthsInput, setEnrollMonthsInput] = useState("1");
  const [maxEnrollMonths, setMaxEnrollMonths] = useState<number | null>(null);
  const [refundModal, setRefundModal] = useState<any>({ open: false, paymentId: null, reasonCode: "", reasonText: "", submitting: false, preview: null });

  // --------------------------
  // Razorpay Loader
  // --------------------------
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existing = document.getElementById("razorpay-js");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "razorpay-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  // --------------------------
  // Payment
  // --------------------------
  const openRazorpay = async (order: any, batchId: string) => {
    delete (window as any).Razorpay;
    await loadRazorpayScript();

    if (!(window as any).Razorpay) {
      toast.error("Unable to load Razorpay");
      return;
    }

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "TuitionsTime",
      description: "Batch Payment",
      order_id: order.orderId,
      handler: async (response: any) => {
        try {
          const verifyRes = await verifyGroupPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            batchId,
          });

          if (verifyRes?.success) {
            toast.success("Enrollment confirmed");
            await fetchData();
          } else {
            toast.error("Verification failed");
          }
        } catch (e: any) {
          toast.error(e.message || "Verification failed");
        }
      },
      theme: { color: "#207EA9" },
    } as any;

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // --------------------------
  // Fetch Batches
  // --------------------------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listBatches(filters as any);
      const filtered = (data || []).filter((b: any) => {
        const tutor = b?.tutor || b?.owner || b?.createdBy || {};
        const status = String(
          (tutor && (tutor.status || tutor.user?.status || (b as any).tutorStatus)) || "",
        ).toLowerCase();
        return status !== "suspended";
      });
      setItems(filtered);
    } catch (e: any) {
      toast.error(e.message || "Unable to load batches");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const isBatchNotification = (detail: any) => {
    const title = String(detail?.data?.title || detail?.data?.message || "").toLowerCase();
    const meta = detail?.data?.meta || {};
    return (
      title.includes("batch") ||
      title.includes("payment") ||
      title.includes("refund") ||
      Boolean(meta.batchId) ||
      Boolean(meta.groupBatchId) ||
      Boolean(meta.paymentId) ||
      Boolean(meta.refundRequestId)
    );
  };

  useEffect(() => {
    fetchData();
  }, [filters.subject, filters.level, filters.date]);

  useNotificationRefresh(() => {
    fetchData();
  }, isBatchNotification);

  // --------------------------
  // Reserve + Pay
  // --------------------------
  const computeMaxMonths = (batch: any) => {
    const startRaw = batch?.recurring?.startDate || batch?.batchStartDate;
    const endRaw = batch?.recurring?.endDate || batch?.batchEndDate;
    const start = startRaw ? new Date(startRaw) : null;
    const end = endRaw ? new Date(endRaw) : null;
    if (!start || Number.isNaN(start.getTime())) return null;
    if (!end || Number.isNaN(end.getTime())) return null;
    if (end < start) return 1;
    const monthsDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const addMonth = end.getDate() > start.getDate() ? 1 : 0;
    return Math.max(1, monthsDiff + addMonth || 1);
  };
  const clampMonths = (val: number, max?: number | null) => {
    const base = Number.isFinite(val) && val > 0 ? val : 1;
    return max ? Math.min(base, max) : base;
  };

  const openEnrollModal = (batch: any) => {
    const maxMonths = computeMaxMonths(batch);
    setEnrollBatch(batch);
    const nextMonths = maxMonths || 1;
    setEnrollMonths(nextMonths);
    setEnrollMonthsInput(String(nextMonths));
    setMaxEnrollMonths(maxMonths);
    setEnrollModalOpen(true);
  };

  const proceedToPay = async () => {
    if (!enrollBatch) return;
    const batchId = enrollBatch._id;
    const isRenewal = !!(enrollBatch?.isEnrolledForCurrentUser || enrollBatch?.myEnrollment);
    
    try {
      let reservationId: string | undefined;
      if (!isRenewal) {
        const res = await reserveSeat(batchId);
        if (!res?.success) {
          toast.error("Reservation failed");
          return;
        }
        reservationId = res.reservationId;
      }

      const safeMonths = clampMonths(
        Number(enrollMonthsInput),
        maxEnrollMonths
      );

      const order = await createGroupOrder({
        batchId,
        reservationId,
        months: safeMonths,
        // couponCode: couponMap[batchId]?.trim(),
      });

      if ((order as any)?.walletPaid) {
        toast.success("Enrollment confirmed via wallet");
        setEnrollModalOpen(false);
        await fetchData();
        return;
      }

      if (!order?.success) {
        toast.error("Order creation failed");
        return;
      }

      await openRazorpay(order, batchId);
      setEnrollModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Join failed");
    }
  };

  // --------------------------
  // Sessions Modal
  // --------------------------
  const getSessionJoinData = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const duration = 60;
    const joinBefore = 5;
    const expireAfter = 5;

    const end = start + duration * 60 * 1000;
    const openAt = start - joinBefore * 60 * 1000;
    const closeAt = end + expireAfter * 60 * 1000;

    const now = Date.now();

    return {
      canJoin: now >= openAt && now <= closeAt,
      isExpired: now > closeAt,
    };
  };

  const openSessionsModal = async (batchId: string) => {
    try {
      setSelectedBatchId(batchId);
      setSessionsModalOpen(true);
      setSessionsLoading(true);

      const res = await api.get(`/group-batches/${batchId}/sessions`);
      setSessions(res.data?.data || []);
    } finally {
      setSessionsLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      if (res.data?.url) window.open(res.data.url, "_blank");
    } catch { }
  };

  const submitRefund = async () => {
    try {
      setRefundModal({ ...refundModal, submitting: true });
      const res = await requestRefund({
        paymentId: refundModal.paymentId,
        reasonCode: refundModal.reasonCode,
        reasonText: refundModal.reasonText
      });
      if (res.success) {
        toast.success("Refund requested");
        setRefundModal({ open: false, paymentId: null, reasonCode: "", reasonText: "", submitting: false, preview: null });
      } else {
        toast.error(res.message || "Failed");
      }
    } catch {
      toast.error("Failed");
    } finally {
      setRefundModal((s: any) => ({ ...s, submitting: false }));
    }
  };

  // --------------------------
  // UI
  // --------------------------
  const list = useMemo(() => items || [], [items]);

  return (
    <>
      {/* ---------------- / BATCH LIST ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((b: any) => (
          <div
            key={b._id}
            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-3 flex flex-col gap-2 w-full"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold">{b.subject}</div>
                <div className="text-[11px] text-gray-500">
                  Board: {b.board || "General"}
                </div>
            <div className="text-[11px] text-gray-500">{b.level || "General"}</div>
            <div className="text-[11px] text-gray-500">{b.batchTypeLabel || b.batchType}</div>
            {b.tutor?.name && (
              <div className="text-[11px] text-gray-500">Tutor: {b.tutor.name}</div>
            )}
          </div>

              {b.isEnrolledForCurrentUser ? (
                <span className="text-[10px] px-2 py-[2px] rounded-full bg-green-100 text-green-700">
                  Enrolled
                </span>
              ) : !b.published ? (
                <span className="text-[10px] px-2 py-[2px] rounded-full bg-yellow-100 text-yellow-700">
                  Coming Soon
                </span>
              ) : (
                <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-100 text-blue-700">
                  Available
                </span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-1 text-[12px]">
              
              {b.batchStartDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Start{" "}
                  {new Date(b.batchStartDate).toLocaleDateString("en-IN")}
                </div>
              )}
              {b.batchEndDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> End{" "}
                  {new Date(b.batchEndDate).toLocaleDateString("en-IN")}
                </div>
              )}
              {!b.batchEndDate && b.recurring?.endDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> End{" "}
                  {new Date(b.recurring.endDate).toLocaleDateString("en-IN")}
                </div>
              )}
              {b.recurring?.time && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Time {formatTime(b.recurring.time)}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" /> Seats available: {b.liveSeats}/{b.seatCap}
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> ₹{b.pricePerStudent} / month
              </div>
              {/* <div className="flex items-center gap-1">
                <Video className="w-3 h-3" /> Online Class
              </div> */}
              {b.description && (
                <div className="text-[11px] text-gray-600">{b.description}</div>
              )}
            </div>

            {(() => {
              const now = Date.now();
              const validUntil = b.myEnrollment?.validUntil ? new Date(b.myEnrollment.validUntil).getTime() : null;
              const daysLeft = validUntil !== null ? Math.ceil((validUntil - now) / (24 * 60 * 60 * 1000)) : null;
              const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 5;
              const expired = daysLeft !== null && daysLeft < 0;
              if (!b.isEnrolledForCurrentUser || (!expiringSoon && !expired)) return null;
              return (
                <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
                  {expired
                    ? "Subscription expired. Please renew to continue."
                    : `Subscription ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Please renew.`}
                </div>
              );
            })()}

            {/* Small CTA Buttons */}
            <div className="flex flex-wrap gap-2 mt-1">
              {(() => {
                const now = Date.now();
                const validUntil = b.myEnrollment?.validUntil ? new Date(b.myEnrollment.validUntil).getTime() : null;
                const daysLeft = validUntil !== null ? Math.ceil((validUntil - now) / (24 * 60 * 60 * 1000)) : null;
                const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 5;
                const expired = daysLeft !== null && daysLeft < 0;
                if (!b.isEnrolledForCurrentUser) {
                  return (
                    <>
                      <Link href={`/dashboard/student/group-batches/${b._id}`} className="flex-1">
                        <Button variant="secondary" className="w-full h-8 px-3 text-xs">
                          Details
                        </Button>
                      </Link>
                      <Button
                        disabled={loading || b.liveSeats <= 0 || !b.published}
                        onClick={() => openEnrollModal(b)}
                        className="flex-1 h-8 px-3 text-xs bg-primary text-black"
                      >
                        {!b.published ? "Coming Soon" : loading ? "Processing..." : "Join Now"}
                      </Button>
                    </>
                  );
                }
                return (
                  <>
                    <Link href={`/dashboard/student/group-batches/${b._id}`} className="flex-1">
                      <Button variant="secondary" className="w-full h-8 px-3 text-xs">
                        Details
                      </Button>
                    </Link>
                    {!expired && (
                      <Button
                        variant="secondary"
                        onClick={() => openSessionsModal(b._id)}
                        className="flex-1 h-8 px-3 text-xs"
                      >
                        View Sessions
                      </Button>
                    )}
                    {(expiringSoon || expired) && (
                      <Button
                        className="flex-1 h-8 px-3 text-xs bg-primary text-black"
                        onClick={() => openEnrollModal(b)}
                      >
                        Renew Now
                      </Button>
                    )}
                    {b.myPaymentId && (
                      <Button
                        variant="outline"
                        className="flex-1 h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRefundModal({ open: true, paymentId: b.myPaymentId, reasonCode: "", reasonText: "", submitting: false, preview: null })}
                      >
                        Refund
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </div>


      {/* ---------------- / ENROLLMENT MODAL ---------------- */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {(enrollBatch?.isEnrolledForCurrentUser || enrollBatch?.myEnrollment) ? "Renew" : "Enroll"} in {enrollBatch?.subject}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span>Monthly price:</span>
              <span className="font-medium">₹{enrollBatch?.pricePerStudent}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Months</label>
              <input
                type="number"
                min={1}
                max={maxEnrollMonths || undefined}
                className="w-full border rounded px-3 py-2 text-sm"
                value={enrollMonthsInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setEnrollMonthsInput("");
                    return;
                  }
                  const parsed = Number(raw);
                  if (!Number.isFinite(parsed)) return;
                  const capped = clampMonths(parsed, maxEnrollMonths);
                  setEnrollMonthsInput(String(capped));
                  setEnrollMonths(capped);
                }}
                onBlur={() => {
                  const capped = clampMonths(Number(enrollMonthsInput), maxEnrollMonths);
                  setEnrollMonths(capped);
                  setEnrollMonthsInput(String(capped));
                }}
              />
              {maxEnrollMonths && (
                <p className="text-xs text-gray-500">
                  Max {maxEnrollMonths} month{maxEnrollMonths === 1 ? "" : "s"} based on batch end date.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                ₹{(enrollBatch?.pricePerStudent || 0) *
                  clampMonths(Number(enrollMonthsInput), maxEnrollMonths)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollModalOpen(false)}>Cancel</Button>
            <Button onClick={proceedToPay}>
              {(enrollBatch?.isEnrolledForCurrentUser || enrollBatch?.myEnrollment) ? "Pay & Renew" : "Pay & Enroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- / REFUND MODAL ---------------- */}
      <Dialog open={refundModal.open} onOpenChange={(open) => !open && setRefundModal({ ...refundModal, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={refundModal.reasonCode}
                onChange={async (e) => {
                  const code = e.target.value;
                  const next = { ...refundModal, reasonCode: code };
                  setRefundModal(next);
                  if (refundModal.paymentId && code) {
                    try {
                      const pv = await previewRefund({ paymentId: refundModal.paymentId, reasonCode: code, reasonText: next.reasonText || undefined });
                      setRefundModal((f: any) => ({ ...f, preview: pv }));
                    } catch {}
                  }
                }}
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
            </div>

            {refundModal.reasonCode === "OTHER" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  value={refundModal.reasonText}
                  onChange={async (e) => {
                    const txt = e.target.value;
                    setRefundModal((f: any) => ({ ...f, reasonText: txt }));
                    if (refundModal.paymentId && refundModal.reasonCode) {
                      try {
                        const pv = await previewRefund({ paymentId: refundModal.paymentId, reasonCode: refundModal.reasonCode, reasonText: txt });
                        setRefundModal((f: any) => ({ ...f, preview: pv }));
                      } catch {}
                    }
                  }}
                />
              </div>
            )}

            {refundModal.preview && (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded space-y-1">
                <div className="flex justify-between"><span>Completion:</span> <span>{Math.round((refundModal.preview.completionPercentage || 0) * 100)}%</span></div>
                <div className="flex justify-between"><span>Refundable:</span> <span>{Math.round((refundModal.preview.refundablePercentage || 0) * 100)}%</span></div>
                <div className="flex justify-between font-medium"><span>Max Amount:</span> <span>₹{refundModal.preview.maximumRefundableAmount || 0}</span></div>
                <div className="text-xs text-gray-500 mt-1">{refundModal.preview.explanation || ""}</div>
                <div className="text-xs text-gray-500">Method: {refundModal.preview.suggestedRefundMethod}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundModal({ ...refundModal, open: false })}>Cancel</Button>
            <Button 
              onClick={submitRefund} 
              disabled={refundModal.submitting || !refundModal.reasonCode || (refundModal.reasonCode === "OTHER" && !refundModal.reasonText)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {refundModal.submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- / SESSIONS MODAL ---------------- */}
      <GroupSessionsModal
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        sessions={sessions}
        loading={sessionsLoading}
        onJoin={joinSession}
        getSessionJoinData={getSessionJoinData}
      />
    </>
  );
}
