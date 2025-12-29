"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Link as LinkIcon,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentBatchDetail() {
  const params = useParams() as any;
  const id = params?.id as string;
  const [batch, setBatch] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const formatTime = (time?: string) => {
    if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return time || "";
    const [h, m] = time.split(":").map(Number);
    const d = new Date(0, 0, 0, h, m);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };
  const formatDate = (value?: string | Date) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formatDateTime = (value?: string | Date) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  const batchTypeLabel = (t?: string) => {
    if (!t) return "";
    if (t === "normal class" || t === "normal" || t === "exam") return "Normal Class";
    if (t === "revision") return "Revision";
    return t;
  };

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const b = await api.get(`/group-batches/${id}`);
      setBatch(b.data?.data || null);
      const s = await api.get(`/group-batches/${id}/sessions`);
      setSessions(s.data?.data || []);
    } catch (e: any) {
      toast.error(e.message || "Unable to load batch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const getSessionJoinData = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const classDurationMin = 60;
    const joinBeforeMin = batch?.accessWindow?.joinBeforeMin ?? 5;
    const expireAfterMin = batch?.accessWindow?.expireAfterMin ?? 5;
    const end = start + classDurationMin * 60 * 1000;
    const openAt = start - joinBeforeMin * 60 * 1000;
    const closeAt = end + expireAfterMin * 60 * 1000;
    const now = Date.now();
    const canJoin = now >= openAt && now <= closeAt;
    const isExpired = now > closeAt;
    return { canJoin, isExpired };
  };

  const join = async (sessionId: string) => {
    try {
      const res = await api.post(`/sessions/${sessionId}/join`);
      const url = res.data?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Join window closed");
      }
    } catch (e: any) {
      toast.error(e.message || "Join failed");
    }
  };

  return (
    <>
      {batch && (
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-5 py-4 border-b bg-gradient-to-r from-amber-50 via-white to-orange-50">
            <div className="text-lg font-semibold">Batch Details</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{batch.subject || "N/A"}</span>
              {batch.level && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                  {batch.level}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
                {batchTypeLabel(batch.batchType) || "N/A"}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  batch.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {batch.status || "N/A"}
              </span>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm font-semibold mb-3">Overview</div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Board</span>
                  <span className="ml-auto text-gray-600">{batch.board || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Seats</span>
                  <span className="ml-auto text-gray-600">
                    {batch.liveSeats}/{batch.seatCap}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Price</span>
                  <span className="ml-auto text-gray-600">
                    Rs {batch.pricePerStudent ?? "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Status</span>
                  <span className="ml-auto text-gray-600">
                    {batch.published ? "Published" : "Unpublished"}
                  </span>
                </div>
                {batch.meetingLink && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <a className="text-blue-600" href={batch.meetingLink} target="_blank">
                      Meeting link
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm font-semibold mb-3">Schedule</div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Start date</span>
                  <span className="ml-auto text-gray-600">
                    {formatDate(batch.recurring?.startDate) ||
                      formatDate(batch.batchStartDate) ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Class time</span>
                  <span className="ml-auto text-gray-600">
                    {batch.recurring?.time ? formatTime(batch.recurring.time) : "N/A"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="font-medium text-gray-900">Days</span>
                  <span className="ml-auto text-gray-600 text-right">
                    {batch.recurring?.days?.length ? batch.recurring.days.join(", ") : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Join before</span>
                  <span className="ml-auto text-gray-600">
                    {batch.accessWindow?.joinBeforeMin ?? 5} min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Expire after</span>
                  <span className="ml-auto text-gray-600">
                    {batch.accessWindow?.expireAfterMin ?? 5} min
                  </span>
                </div>
                {batch.myEnrollment?.validUntil && (
                  <div className="pt-2 mt-1 border-t text-sm">
                    <span className="font-semibold text-green-700">Active until:</span>{" "}
                    {formatDate(batch.myEnrollment.validUntil)}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 lg:col-span-2">
              <div className="text-sm font-semibold mb-2">Description</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {batch.description || "N/A"}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 lg:col-span-2">
              <div className="text-sm font-semibold mb-2">Enrollment Window</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Open at</span>
                  <span className="ml-auto text-gray-600">
                    {formatDateTime(batch.enrollmentOpenAt) || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Close at</span>
                  <span className="ml-auto text-gray-600">
                    {formatDateTime(batch.enrollmentCloseAt) || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


