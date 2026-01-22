"use client";

import { useEffect, useState } from "react";
import { createDemoBooking } from "@/services/studentService";
import { Button } from "@/components/ui/button";
import { X, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile } from "@/services/profileService";

// MUI X Date Pickers + Dayjs
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

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
  const [subjectsSelected, setSubjectsSelected] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<Dayjs | null>(null); // MUI time value
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentBoard, setStudentBoard] = useState("");
  const [studentLearningMode, setStudentLearningMode] = useState("");
  const todayStr = new Date().toISOString().slice(0, 10);
  const availableFromToday = availability.filter((d) => d >= todayStr);
  const isTodaySelected = date === todayStr;
  const minTime = isTodaySelected ? dayjs() : undefined;

  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res?.success && res?.data?.profile) {
          setStudentBoard(res.data.profile.board || "");
          setStudentLearningMode(res.data.profile.learningMode || "");
        }
      } catch {}
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!open) return;
    setDate("");
    setTime(null);
    setNote("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!subjectsSelected.length || !date || !time) {
      toast({
        title: "Missing Fields",
        description: "Please select subject, date & time before booking.",
      });
      return;
    }

    if (isTodaySelected && time.isBefore(dayjs())) {
      toast({
        title: "Invalid Time",
        description: "Please select a future time.",
      });
      return;
    }

    // Convert Dayjs -> "HH:mm" (24-hour format) for backend
    const time24 = time.format("HH:mm"); // e.g. "18:30"

    const normalizeBookingError = (msg: string) =>
      msg.includes("active demo")
        ? "You already have an active demo. Complete it before booking another."
        : msg;

    try {
      setLoading(true);

      const res = await createDemoBooking({
        tutorId,
        subjects: subjectsSelected,
        subject: subjectsSelected[0],
        date,
        time: time24,
        note,
        studentBoard,
        studentLearningMode,
      });

      if (res.success) {
        toast({
          title: "Demo Booked 🎉",
          description: "Your demo has been booked successfully!",
        });
        onClose();
      } else {
        toast({
          title: "Booking Failed",
          description: normalizeBookingError(
            res.message || "Something went wrong."
          ),
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Server Error",
        description: normalizeBookingError(
          err.message || "Unable to create booking."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-3 animate-fadeIn">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-2xl shadow-lg p-4 sm:p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <CalendarDays className="w-5 h-5 text-[#FFD54F]" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Book Free Demo with {tutorName}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Student Info */}
          {(studentBoard || studentLearningMode) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {studentBoard && (
                <div>
                  <span className="text-xs font-medium text-gray-600">Board:</span>{" "}
                  {studentBoard}
                </div>
              )}
              {studentLearningMode && (
                <div>
                  <span className="text-xs font-medium text-gray-600">Mode:</span>{" "}
                  {studentLearningMode}
                </div>
              )}
            </div>
          )}

          {/* Learning Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Mode
            </label>
            <div className="flex gap-2">
              {["Online", "Offline"].map((mode) => {
                const active = studentLearningMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStudentLearningMode(mode)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-[#FFD54F]/30 border-[#FFD54F] text-gray-900"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subjects <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects?.map((s) => {
                const active = subjectsSelected.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (active) {
                        setSubjectsSelected(
                          subjectsSelected.filter((x) => x !== s)
                        );
                      } else {
                        setSubjectsSelected([...subjectsSelected, s]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-[#FFD54F]/30 border-[#FFD54F] text-gray-900"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date <span className="text-red-500">*</span>
            </label>

            {availableFromToday.length > 0 ? (
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F]"
              >
                <option value="">-- Select available date --</option>
                {availableFromToday.map((d) => (
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

          {/* Time – MUI Clock Picker with every minute */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Time <span className="text-red-500">*</span>
            </label>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                value={time}
                onChange={(newValue) => setTime(newValue)}
                 ampm
                 minTime={minTime}
                minutesStep={1} // ✅ every single minute available
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>

            <p className="text-xs text-gray-400 mt-1">
              Demo duration is 15 minutes.
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F]"
              placeholder="Any specific requests or details..."
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-[#FFD54F] text-black font-semibold rounded-full hover:bg-[#f0c945]"
        >
          {loading ? "Booking..." : "Confirm Free Demo"}
        </Button>
      </div>
    </div>
  );
}