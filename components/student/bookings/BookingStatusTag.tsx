"use client";

export default function BookingStatusTag({ status }: { status: string }) {
  const badgeStyles: any = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-green-100 text-green-700 border-green-300",
    completed: "bg-blue-100 text-blue-700 border-blue-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
    expired: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-medium border 
        ${badgeStyles[status] || "bg-gray-100 text-gray-700 border-gray-300"}
      `}
    >
      {String(status || "unknown").charAt(0).toUpperCase() +
        String(status || "unknown").slice(1)}
    </span>
  );
}
