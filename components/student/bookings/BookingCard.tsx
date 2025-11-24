"use client";

import {
  CalendarDays,
  Clock,
  BookOpen,
  StickyNote,
  User,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/store/store";
import { markJoiningDemo } from "@/store/slices/reviewSlice";
import BookingStatusTag from "./BookingStatusTag";
import UpgradeToRegularModal from "@/components/UpgradeToRegularModal";

type BookingType = {
  _id: string;
  preferredDate: string;
  preferredTime?: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  status: string;
  type: "demo" | "regular";
  meetingLink?: string;
  note?: string;
  requestedBy?: "student" | "tutor";

  // IMPORTANT — ensure demoFeedback exists
  demoFeedback?: {
    likedTutor: boolean;
  };
};

export default function BookingCard({
  booking,
  compact = false,
}: {
  booking: BookingType;
  compact?: boolean;
}) {

  // Debug — verify booking object is correct
  console.log("BOOKING RECEIVED:", booking);

  const dispatch = useAppDispatch();

  const sessionStart = useMemo(() => {
    const base = new Date(booking.preferredDate);
    if (!booking.preferredTime) return base;

    const [hStr, mStr] = booking.preferredTime.split(":");
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      Number(hStr) || 0,
      Number(mStr) || 0,
      0
    );
  }, [booking.preferredDate, booking.preferredTime]);

  const [canJoin, setCanJoin] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const EARLY_JOIN_MINUTES = 10;
    const LATE_JOIN_MINUTES = 30;
    const SESSION_DURATION_MIN = booking.type === "demo" ? 15 : 60;

    const checkWindow = () => {
      const now = new Date();

      const joinOpenAt = new Date(
        sessionStart.getTime() - EARLY_JOIN_MINUTES * 60 * 1000
      );
      const joinCloseAt = new Date(
        sessionStart.getTime() +
        (SESSION_DURATION_MIN + LATE_JOIN_MINUTES) * 60 * 1000
      );

      setCanJoin(now >= joinOpenAt && now <= joinCloseAt);
    };

    checkWindow();
    const id = setInterval(checkWindow, 30 * 1000);
    return () => clearInterval(id);
  }, [sessionStart, booking.type]);

  const dateFormatted = sessionStart.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div
        className={`
        bg-white rounded-2xl border border-gray-200
        shadow-[0_8px_24px_rgba(0,0,0,0.05)]
        ${compact ? "p-4" : "p-5"}
        space-y-4
        hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]
        transition w-full
      `}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2
            className={`font-semibold text-gray-900 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {booking.type === "demo"
              ? `Demo booking with ${booking.tutorName}`
              : `Regular Class with ${booking.tutorName}`}
          </h2>
          <BookingStatusTag status={booking.status} />
        </div>

        {/* SUBJECT */}
        <div className="flex items-center gap-2 text-gray-800 text-sm">
          <BookOpen className="w-4 h-4 text-[--primary]" />
          <span className="font-medium">{booking.subject}</span>
        </div>

        {/* DATE + TIME */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-[--primary]" />
            {dateFormatted}
          </span>

          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-[--primary]" />
            {booking.preferredTime}
          </span>
        </div>

        {/* SESSION TYPE */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="w-4 h-4 text-[--primary]" />
          {booking.type === "demo" ? "Demo Session" : "Regular Class"}
        </div>

        {/* JOIN BUTTON */}
        {booking.status !== "completed" && booking.meetingLink && canJoin ? (
          <button
            type="button"
            onClick={() => {
              dispatch(
                markJoiningDemo({
                  bookingId: booking._id,
                  tutorId: booking.tutorId,
                  tutorName: booking.tutorName,
                })
              );
              window.open(booking.meetingLink!, "_blank", "noopener,noreferrer");
            }}
            className={`
              inline-flex items-center gap-2 font-semibold text-sm
              px-4 py-2 rounded-full w-fit transition
              bg-[#FFD54F] hover:bg-[#f3c942] text-black cursor-pointer
            `}
          >
            <Video className="w-4 h-4" />
            Join {booking.type === "demo" ? "Demo" : "Class"}
          </button>
        ) : booking.status !== "completed" ? (
          booking.type === "demo" && booking.status === "pending" ? (
            <p className="text-xs text-gray-500 italic">
              {booking.requestedBy === "student"
                ? "Pending Tutor Approval"
                : "Pending Your Approval (see Demo Requests)"}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Meeting link will appear close to the session start time.
            </p>
          )
        ) : null}

        {/* ⭐ START REGULAR CLASSES BUTTON ⭐ */}
        {booking.type === "demo" &&
          booking.status === "completed" && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="mt-2 bg-[#FFD54F] text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-[#FFD54F]"
            >
              Start Regular Classes
            </button>
          )}

        {/* NOTES */}
        {booking.note && booking.note.trim() !== "" && (
          <div className="flex items-center gap-2 text-sm text-gray-700 border-t pt-3">
            <StickyNote className="w-4 h-4 text-[--primary]" />
            {booking.note}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showUpgradeModal && (
        <UpgradeToRegularModal
          booking={booking}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
}
