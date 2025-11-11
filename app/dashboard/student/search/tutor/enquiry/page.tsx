"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SendEnquiryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutor");

  const [tutor, setTutor] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tutorId) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tutors/${tutorId}`)
        .then((r) => r.json())
        .then((res) => setTutor(res.data))
        .catch(() => toast.error("Failed to load tutor"));
    }
  }, [tutorId]);

  const handleSubmit = async () => {
    if (!message.trim()) return toast.error("Message cannot be empty");
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tutorId, message }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Enquiry sent successfully!");
        router.push(`/dashboard/student/enquiries`);
      } else toast.error(data.message || "Failed to send enquiry");
    } catch (err) {
      console.error(err);
      toast.error("Error sending enquiry");
    } finally {
      setLoading(false);
    }
  };

  if (!tutor)
    return <div className="p-6 text-center text-gray-500">Loading tutor details...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow space-y-5">
      <h1 className="text-xl font-semibold">Send Enquiry to {tutor.name}</h1>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm"
        placeholder="Write your message..."
        rows={5}
      />

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#FFD54F] text-black font-semibold rounded-full hover:bg-[#f0c945]"
      >
        {loading ? "Sending..." : "Send Enquiry"}
      </Button>
    </div>
  );
}
