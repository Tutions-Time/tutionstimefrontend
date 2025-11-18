"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";   // ✅ Correct toast import
import { bookStudentDemo } from "@/services/bookingService";

interface Props {
  open: boolean;
  onClose: () => void;
  student: any;
}

export default function BookStudentDemoModal({ open, onClose, student }: Props) {
  if (!open || !student) return null;

  const {
    userId,
    subjects = [],
    availability = [],
  } = student;

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const showSuccess = (msg: string) =>
    toast({
      title: "Success",
      description: msg,
    });

  const showError = (msg: string) =>
    toast({
      variant: "destructive",
      title: "Error",
      description: msg,
    });

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedDate || !selectedTime) {
      showError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await bookStudentDemo({
        studentId: userId,
        subject: selectedSubject,
        date: selectedDate,
        time: selectedTime,
        note,
      });

      if (res?.success) {
        showSuccess(res?.message || "Demo booked successfully");
        onClose();
      } else {
        showError(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to book demo.";

      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-5 relative">

        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Book Demo Session
        </h2>

        {/* Subject */}
        <label className="text-xs font-medium text-gray-600">Subject</label>
        <select
          className="w-full mt-1 mb-3 rounded-lg border px-3 py-2 text-sm"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          {subjects.map((s: string, idx: number) => (
            <option key={idx} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Dates */}
        <label className="text-xs font-medium text-gray-600">Available Dates</label>
        <select
          className="w-full mt-1 mb-3 rounded-lg border px-3 py-2 text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">Select Date</option>
          {availability.map((d: string, idx: number) => (
            <option key={idx} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Time */}
        <label className="text-xs font-medium text-gray-600">Select Time</label>
        <input
          type="time"
          className="w-full mt-1 mb-3 rounded-lg border px-3 py-2 text-sm"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        />

        {/* Note */}
        <label className="text-xs font-medium text-gray-600">Note (Optional)</label>
        <textarea
          rows={3}
          className="w-full mt-1 mb-4 rounded-lg border px-3 py-2 text-sm"
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 text-black py-2 text-sm font-semibold hover:bg-primary-700"
        >
          {loading ? "Booking..." : "Book Demo"}
        </button>

      </div>
    </div>
  );
}
