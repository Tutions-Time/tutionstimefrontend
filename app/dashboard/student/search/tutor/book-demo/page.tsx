"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchTutorById, createDemoBooking } from "@/services/studentService";
import { getUserProfile } from "@/services/profileService";

export default function BookDemoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutor");

  const [tutor, setTutor] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");   // ⭐ ADDED
  const [subjects, setSubjects] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentBoard, setStudentBoard] = useState("");
  const [studentLearningMode, setStudentLearningMode] = useState("");

  useEffect(() => {
    if (tutorId) {
      fetchTutorById(tutorId)
        .then(setTutor)
        .catch(() => toast.error("Failed to load tutor"));
    }
  }, [tutorId]);

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

  const handleSubmit = async () => {
    if (!date || !subjects.length || !time) {
      toast.error("Please fill all fields");
      return;
    }

    const normalizeBookingError = (msg: string) =>
      msg.includes("active demo")
        ? "You already have an active demo. Complete it before booking another."
        : msg;

    try {
      setLoading(true);

      const res = await createDemoBooking({
        tutorId: tutorId!,
        subjects,
        subject: subjects[0],
        date,
        time,     // Time in 24-hour format
        note,
        studentBoard,
        studentLearningMode,
      });

      if (res.success) {
        toast.success("Demo booked successfully!");
        router.push("/dashboard/student/bookings");
      } else {
        toast.error(
          normalizeBookingError(res.message || "Booking failed")
        );
      }
    } catch (err: any) {
      toast.error(
        normalizeBookingError(err.message || "Error booking demo")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!tutor)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading tutor details...
      </div>
    );

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow space-y-5">
      <h1 className="text-xl font-semibold">Book Free Demo with {tutor.name}</h1>

      <div className="space-y-3">
        {/* Subject */}
        <label className="block text-sm font-medium text-gray-700">
          Select Subjects
        </label>
        <select
          multiple
          value={subjects}
          onChange={(e) =>
            setSubjects(
              Array.from(e.target.selectedOptions, (opt) => opt.value)
            )
          }
          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          size={Math.min(6, tutor.subjects?.length || 6)}
        >
          {tutor.subjects?.map((s: string) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Date */}
        <label className="block text-sm font-medium text-gray-700 mt-4">
          Select Date
        </label>
        <Input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Time */}
        <label className="block text-sm font-medium text-gray-700 mt-4">
          Select Time
        </label>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {/* Note */}
        <label className="block text-sm font-medium text-gray-700 mt-4">
          Message (Optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          placeholder="Write any special request..."
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#FFD54F] text-black font-semibold rounded-full hover:bg-[#f0c945]"
      >
        {loading ? "Booking..." : "Confirm Free Demo"}
      </Button>
    </div>
  );
}
