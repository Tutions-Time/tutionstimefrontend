"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getUserProfile, bookStudentDemo } from "@/services/bookingService";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

export default function BookStudentDemoModal({ open, onClose, studentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) fetchStudentProfile();
  }, [open]);

  const fetchStudentProfile = async () => {
    try {
      const data = await getUserProfile();

      setSubjects(data.profile?.subjects || []);
      setAvailability(data.profile?.availability || []);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      await bookStudentDemo({
        studentId,
        subject: selectedSubject,
        date: selectedDate,
        time: selectedTime,
        note,
      });

      onClose();
    } catch (err) {
      console.error("Demo Booking Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
          {subjects.map((s, idx) => (
            <option key={idx} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Date */}
        <label className="text-xs font-medium text-gray-600">Available Dates</label>
        <select
          className="w-full mt-1 mb-3 rounded-lg border px-3 py-2 text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">Select Date</option>
          {availability.map((d, idx) => (
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
