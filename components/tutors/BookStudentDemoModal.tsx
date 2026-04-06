"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { bookStudentDemo } from "@/services/bookingService";

const EMPTY_ARRAY: any[] = [];

interface Props {
  open: boolean;
  onClose: () => void;
  student: any;
}

export default function BookStudentDemoModal({
  open,
  onClose,
  student,
}: Props) {
  const userId = student?.userId;
  const subjects = Array.isArray(student?.subjects)
    ? student.subjects
    : EMPTY_ARRAY;
  const preferredTimes = Array.isArray(student?.preferredTimes)
    ? student.preferredTimes
    : EMPTY_ARRAY;
  const board = student?.board;
  const learningMode = student?.learningMode;
  const studentLearningMode = student?.studentLearningMode;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [selectedPreferredSlot, setSelectedPreferredSlot] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const resolvedLearningMode = learningMode || studentLearningMode || "";
  const todayStr = dayjs().format("YYYY-MM-DD");
  const hasPreferredSlots =
    Array.isArray(preferredTimes) && preferredTimes.length > 0;

  const selectedDay = selectedDate ? dayjs(selectedDate) : null;
  const isSelectedDayToday = selectedDay?.isSame(dayjs(), "day");
  const minTimeForToday = isSelectedDayToday
    ? dayjs().startOf("minute")
    : undefined;

  // Auto-select all subjects (joined) for submission
  const selectedSubject = useMemo(() => subjects.join(", "), [subjects]);

  useEffect(() => {
    if (!open) return;
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedPreferredSlot("");
    setNote("");
  }, [open]);

  useEffect(() => {
    setSelectedTime(null);
    setSelectedPreferredSlot("");
  }, [selectedDate]);

  const getStartTimeFromPreferredSlot = (slot: string) => {
    const part = String(slot || "")
      .split("-")[0]
      ?.trim();
    const m = part?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2]);
    const period = String(m[3]).toUpperCase();
    if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
    h = h % 12;
    if (period === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  };

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
    if (!userId || !selectedSubject || !selectedDate) {
      showError("Please fill all fields");
      return;
    }

    const selectedTime24 = hasPreferredSlots
      ? getStartTimeFromPreferredSlot(selectedPreferredSlot)
      : selectedTime
        ? selectedTime.format("HH:mm")
        : "";

    if (!selectedTime24) {
      showError("Please select a preferred time");
      return;
    }

    const [selHour, selMinute] = selectedTime24.split(":").map(Number);

    const bookingMoment = dayjs(selectedDate)
      .hour(selHour || 0)
      .minute(selMinute || 0)
      .second(0)
      .millisecond(0);

    if (bookingMoment.isBefore(dayjs())) {
      showError("Please select a future time slot");
      return;
    }

    setLoading(true);

    try {
      const res = await bookStudentDemo({
        studentId: userId,
        subject: selectedSubject,
        date: selectedDate,
        time: selectedTime24,
        note,
        studentLearningMode: resolvedLearningMode,
      });

      if (res?.success) {
        showSuccess(res?.message || "Demo booked successfully");
        onClose();
      } else {
        showError(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to book demo.";

      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !student) return null;

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
            <span className="text-xs font-medium text-gray-600 mr-1.5">
              Board:
            </span>
            {board}
          </p>
        )}
        {resolvedLearningMode && (
          <p className="mb-3 text-sm text-gray-700">
            <span className="text-xs font-medium text-gray-600 mr-1.5">
              Mode:
            </span>
            {resolvedLearningMode}
          </p>
        )}

        {/* Subjects */}
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Required Subjects
          </p>
          <div className="flex flex-wrap gap-2">
            {subjects.length === 0 && (
              <span className="text-xs text-gray-500">
                No subjects provided
              </span>
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
        <label className="text-xs font-medium text-gray-600">Select Date</label>
        <input
          type="date"
          min={todayStr}
          className="w-full mt-1 mb-3 rounded-lg border px-3 py-2 text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {/* Time */}
        <label className="text-xs font-medium text-gray-600">
          {hasPreferredSlots ? "Student Preferred Time" : "Select Time"}
        </label>
        {hasPreferredSlots ? (
          <>
            <p className="text-[10px] text-gray-500 mb-1">
              Select one of the student's preferred time slots.
            </p>
            <select
              className="w-full mt-1 mb-3 rounded-lg border px-3 py-2 text-sm"
              value={selectedPreferredSlot}
              onChange={(e) => setSelectedPreferredSlot(e.target.value)}
            >
              <option value="">Select Preferred Time</option>
              {preferredTimes.map((slot: string, idx: number) => (
                <option key={`${slot}-${idx}`} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            {isSelectedDayToday && (
              <p className="text-[10px] text-gray-500 mb-1">
                Only future time slots are selectable for today.
              </p>
            )}
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
                minTime={minTimeForToday}
                disablePast={isSelectedDayToday}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    className: "mt-1 mb-3",
                  },
                }}
              />
            </LocalizationProvider>
          </>
        )}

        {/* Note */}
        <label className="text-xs font-medium text-gray-600">
          Note (Optional)
        </label>
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
