"use client";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Hash,
  Link as LinkIcon,
  MapPin,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batch: any | null;
  roster: any[];
};

export default function TutorBatchDetailModal({ open, onOpenChange, batch, roster }: Props) {
  const formatTime = (time?: string) => {
    if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return time || "";
    const [h, m] = time.split(":").map(Number);
    const d = new Date(0, 0, 0, h, m);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  };
  const formatDate = (value?: string | Date) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
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
      timeZone: "UTC",
    });
  };
  const addDays = (value?: string | Date, days = 7) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + days);
    return d;
  };
  const batchTypeLabel = (t?: string) => {
    if (!t) return "";
    if (t === "normal class" || t === "normal" || t === "exam") return "Normal Class";
    if (t === "revision") return "Revision";
    return t;
  };
  const fixedDateList = Array.isArray(batch?.fixedDates)
    ? batch.fixedDates.map((d: string) => formatDate(d)).filter(Boolean)
    : [];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto p-0">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-amber-50 via-white to-orange-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Batch Details</DialogTitle>
          </DialogHeader>
          {batch && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold">{batch.subject || "N/A"}</div>
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
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                {batch.published ? "Published" : "Unpublished"}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {batch && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-4 shadow-sm">
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
                    <span className="font-medium text-gray-900">Published</span>
                    <span className="ml-auto text-gray-600">
                      {batch.published ? "Yes" : "No"}
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

              <div className="rounded-xl border bg-white p-4 shadow-sm">
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
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">End time</span>
                    <span className="ml-auto text-gray-600">
                      {batch.recurring?.endTime ? formatTime(batch.recurring.endTime) : "N/A"}
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
                  {fixedDateList.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Fixed dates: {fixedDateList.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold mb-3">Enrollment</div>
                <div className="space-y-2 text-sm text-gray-700">
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
                      {formatDateTime(batch.enrollmentCloseAt) ||
                        formatDateTime(
                          addDays(batch.enrollmentOpenAt || batch.batchStartDate || batch.recurring?.startDate, 7)
                        ) ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">Batch end</span>
                    <span className="ml-auto text-gray-600">
                      {formatDate(batch.batchEndDate) ||
                        formatDate(batch.recurring?.endDate) ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold mb-3">Description</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {batch.description || "N/A"}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold mb-3">Roster ({roster.length})</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
              {roster.map((s: any) => (
                <li key={s._id} className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{s.name || s._id}</span>
                </li>
              ))}
              {roster.length === 0 && (
                <li className="text-gray-500 text-sm">No students</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


