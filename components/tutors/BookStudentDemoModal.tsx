"use client";

import { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
    board,
  } = student;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const validAvailability = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return availability.filter((date: string) => {
      const parsed = new Date(date);
      return !Number.isNaN(parsed.getTime()) && parsed >= today;
    });
  }, [availability]);

  // Auto-select all subjects (joined) for submission
  const selectedSubject = useMemo(() => subjects.join(", "), [subjects]);

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
        time: selectedTime.format("HH:mm"),
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

        {/* Board */}
        {board && (
          <p className="mb-3 text-sm text-gray-700">
            <span className="text-xs font-medium text-gray-600 mr-1.5">Board:</span>
            {board}
          </p>
        )}

        {/* Subjects */}
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Required Subjects
          </p>
          <div className="flex flex-wrap gap-2">
            {subjects.length === 0 && (
              <span className="text-xs text-gray-500">No subjects provided</span>
            )}
            {subjects.map((s: string, idx: number) => (
              <span
                key={`${s}-${idx}`}
                className="px-3 py-1 rounded-full text-xs border bg-primary-50 text-gray-800 border-primary-100"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Dates */}
        <label className="text-xs font-medium text-gray-600">Available Dates</label>
        <select
          className="w-full mt-1 mb-3 rounded-lg border px-3 py-2 text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">Select Date</option>
          {validAvailability.map((d: string, idx: number) => (
            <option key={idx} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Time */}
        <label className="text-xs font-medium text-gray-600">Select Time</label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            value={selectedTime}
            onChange={setSelectedTime}
            ampm
            minutesStep={1}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className: "mt-1 mb-3",
              },
            }}
          />
        </LocalizationProvider>

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
          className="w-full rounded-lg bg-primary text-black py-2 text-sm font-semibold hover:bg-primary-700 transition-shadow shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Booking..." : "Book Demo"}
        </button>

      </div>
    </div>
  );
}
