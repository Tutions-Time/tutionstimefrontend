"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchTutorById, createDemoBooking } from "@/services/studentService";

export default function BookDemoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutor");

  const [tutor, setTutor] = useState<any>(null);
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tutorId) {
      fetchTutorById(tutorId)
        .then(setTutor)
        .catch(() => toast.error("Failed to load tutor"));
    }
  }, [tutorId]);

  const handleSubmit = async () => {
    if (!date || !subject) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await createDemoBooking({ tutorId: tutorId!, subject, date, note });
      if (res.success) {
        toast.success("Demo booked successfully!");
        router.push("/dashboard/student/bookings");
      } else {
        toast.error(res.message || "Booking failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error booking demo");
    } finally {
      setLoading(false);
    }
  };

  if (!tutor)
    return <div className="p-6 text-center text-gray-500">Loading tutor details...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow space-y-5">
      <h1 className="text-xl font-semibold">Book Free Demo with {tutor.name}</h1>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Select Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="">-- Select --</option>
          {tutor.subjects?.map((s: string) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-700 mt-4">
          Select Date
        </label>
        <Input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

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
