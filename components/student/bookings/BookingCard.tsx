"use client";

import {
  CalendarDays,
  Clock,
  BookOpen,
  StickyNote,
  LinkIcon,
  User,
  Video,
} from "lucide-react";
import BookingStatusTag from "./BookingStatusTag";

export default function BookingCard({
  booking,
  compact = false,
}: {
  booking: any;
  compact?: boolean;
}) {
  const dateFormatted = new Date(booking.preferredDate).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

  const timeFormatted = new Date(booking.preferredDate).toLocaleTimeString(
    "en-IN",
    { hour: "2-digit", minute: "2-digit" }
  );

  const tutorMasked = booking.tutorName;

  return (
    <div
      className={`
        bg-white 
        rounded-2xl 
        border border-gray-200 
        shadow-[0_8px_24px_rgba(0,0,0,0.05)] 
        ${compact ? "p-4" : "p-5"} 
        space-y-4
        hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] 
        transition
        w-full
      `}
    >
      {/* ========= HEADER ========= */}
      <div className="flex justify-between items-center">
        <h2
          className={`font-semibold text-gray-900 ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          Demo booking with {tutorMasked}
        </h2>

        <BookingStatusTag status={booking.status} />
      </div>

      {/* ========= SUBJECT ========= */}
      <div className="flex items-center gap-2 text-gray-800 text-sm">
        <BookOpen className="w-4 h-4 text-[--primary]" />
        <span className="font-medium">{booking.subject}</span>
      </div>

      {/* ========= DATE + TIME ========= */}
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

      {/* ========= SESSION TYPE ========= */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <User className="w-4 h-4 text-[--primary]" />
        {booking.type === "demo" ? "Demo Session" : "Regular Class"}
      </div>

      {/* ========= MEETING LINK ========= */}
      {booking.meetingLink ? (
        <a
          href={booking.meetingLink}
          target="_blank"
          className="
            inline-flex 
            items-center 
            gap-2 
            bg-[#FFD54F] 
            hover:bg-[#f3c942] 
            text-black 
            font-semibold 
            text-sm 
            px-4 
            py-2 
            rounded-full
            w-fit
            transition
          "
        >
          <Video className="w-4 h-4" />
          Join Demo
        </a>
      ) : (
        <p className="text-xs text-gray-400 italic">
          Meeting link will appear after tutor confirmation.
        </p>
      )}

      {/* ========= NOTES ========= */}
      {booking.note && booking.note.trim() !== "" && (
        <div className="flex items-center gap-2 text-sm text-gray-700 border-t pt-3">
          <StickyNote className="w-4 h-4 text-[--primary]" />
          {booking.note}
        </div>
      )}
    </div>
  );
}
