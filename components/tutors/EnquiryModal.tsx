"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageSquare } from "lucide-react";
import { sendTutorEnquiry } from "@/services/studentService";
import { toast } from "@/hooks/use-toast"; // ✅ use your custom toast

interface EnquiryModalProps {
  open: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
}

export default function EnquiryModal({
  open,
  onClose,
  tutorId,
  tutorName,
}: EnquiryModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!subject || !message) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields.",
        duration: 2000,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await sendTutorEnquiry({ tutorId, subject, message });

      if (res.success) {
        toast({
          title: "Enquiry Sent",
          description: "Your enquiry has been successfully sent to the tutor.",
          duration: 2000,
        });
        setSubject("");
        setMessage("");
        onClose();
      } else {
        toast({
          title: "Failed",
          description: res.message || "Failed to send enquiry.",
          duration: 2000,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error sending enquiry.",
        duration: 2000,
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
          <MessageSquare className="w-5 h-5 text-[#FFD54F]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Send Enquiry to {tutorName}
          </h2>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is your enquiry about?"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#FFD54F] outline-none"
              placeholder="Write your enquiry details..."
              rows={4}
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-[#FFD54F] text-black font-semibold rounded-full hover:bg-[#f0c945] transition"
        >
          {loading ? "Sending..." : "Send Enquiry"}
        </Button>
      </div>
    </div>
  );
}
