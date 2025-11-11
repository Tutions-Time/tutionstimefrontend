"use client";

import { useState } from "react";
import { createDemoBooking } from "@/services/studentService";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { X, CalendarDays } from "lucide-react";

interface BookDemoModalProps {
  open: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
  subjects: string[];
  availability: string[];
}

export default function BookDemoModal({
  open,
  onClose,
  tutorId,
  tutorName,
  subjects,
  availability = [],
}: BookDemoModalProps) {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!subject || !date) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await createDemoBooking({ tutorId, subject, date, note });
      if (res.success) {
        toast.success("Demo booked successfully!");
        onClose();
      } else if (res.message?.includes("not available")) {
        toast.error("Tutor isn’t available on that date. Please choose another day.");
      } else {
        toast.error(res.message || "Booking failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error booking demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="w-5 h-5 text-[#FFD54F]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Book Free Demo with {tutorName}
          </h2>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F] outline-none"
            >
              <option value="">-- Select --</option>
              {subjects?.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date <span className="text-red-500">*</span>
            </label>

            {availability.length > 0 ? (
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F] outline-none"
              >
                <option value="">-- Select available date --</option>
                {availability.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No available dates.</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F] outline-none"
              placeholder="Any specific requests or details..."
              rows={3}
            />
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-[#FFD54F] text-black font-semibold rounded-full hover:bg-[#f0c945] transition"
        >
          {loading ? "Booking..." : "Confirm Free Demo"}
        </Button>
      </div>
    </div>
  );
}
