"use client";

import BookingCard from "./BookingCard";

export default function BookingList({ bookings }: { bookings: any[] }) {
  const autoExpireMessages = [
    "Student was not available for the demo.",
    "Tutor did not join the demo.",
    "Demo expired because no one joined.",
  ];
  const activeBookings = bookings.filter((b) => {
    const isCancelled = b.status?.toLowerCase() === "cancelled";
    if (!isCancelled) return true;
    const comment = b.demoFeedback?.comment;
    return comment && autoExpireMessages.includes(comment);
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
