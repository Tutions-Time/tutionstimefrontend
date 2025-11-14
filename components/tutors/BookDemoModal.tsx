"use client";

import { useState } from "react";
import { createDemoBooking } from "@/services/studentService";
import { Button } from "@/components/ui/button";
import { X, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState<Dayjs | null>(null); // MUI time value
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  if (!open) return null;

  const handleSubmit = async () => {
    if (!subject || !date || !time) {
      toast({
        title: "Missing Fields",
        description: "Please select subject, date & time before booking.",
      });
      return;
    }

    // Convert Dayjs -> "HH:mm" (24-hour format) for backend
    const time24 = time.format("HH:mm"); // e.g. "18:30"

    try {
      setLoading(true);

      const res = await createDemoBooking({
        tutorId,
        subject,
        date,
        time: time24,
        note,
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
          description: res.message || "Something went wrong.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Server Error",
        description: err.message || "Unable to create booking.",
      });
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

        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F]"
            >
              <option value="">-- Select --</option>
              {subjects?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
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
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F]"
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
