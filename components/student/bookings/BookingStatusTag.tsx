"use client";

type BookingStatusTagProps = {
  status: string;
  isExpired?: boolean;
};

export default function BookingStatusTag({
  status,
  isExpired = false,
}: BookingStatusTagProps) {
  const badgeStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-green-100 text-green-700 border-green-300",
    completed: "bg-blue-100 text-blue-700 border-blue-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
    expired: "bg-amber-100 text-amber-800 border-amber-300",
  };

  const label = isExpired ? "Expired" : status.charAt(0).toUpperCase() + status.slice(1);
  const key = isExpired ? "expired" : status;

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-medium border 
        ${badgeStyles[key] || "bg-gray-100 text-gray-700 border-gray-300"}
      `}
    >
      {label}
    </span>
  );
}
