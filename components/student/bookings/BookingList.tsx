"use client";

import BookingCard from "./BookingCard";

export default function BookingList({ bookings }: { bookings: any[] }) {
  // 🔥 REMOVE all cancelled bookings
  const activeBookings = bookings.filter((b) => {
    if (b.status?.toLowerCase() === "cancelled") return false;
    if (b.type === "demo" && b.demoFeedback?.likedTutor === false) return false;
    return true;
  });

  if (!activeBookings.length) {
    return (
      <p className="text-center text-gray-500 mt-10">
        You have no bookings yet.
      </p>
    );
  }

  return (
    <div
      className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        gap-6 
      "
    >
      {activeBookings.map((b) => (
        <BookingCard key={b._id} booking={b} />
      ))}
    </div>
  );
}
