import api from "@/lib/api";

export type CreateBookingPayload = {
  tutorId: string;
  subject: string;
  date: string;       // ISO date (same day as startTime)
  startTime: string;  // ISO datetime
  endTime: string;    // ISO datetime
  type: "demo" | "regular";
  amount: number;     // 0 for demo
};

export type Booking = {
  _id: string;
  tutorId: string | { _id: string; name?: string };
  studentId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  type: "demo" | "regular";
  amount: number;
  paymentStatus: "pending" | "initiated" | "completed" | "failed";
};

export async function createBooking(payload: CreateBookingPayload) {
  const res = await api.post("/bookings", payload);
  return res.data as { success: true; data: Booking };
}

export async function getMyBookings() {
  const res = await api.get("/bookings");
  return res.data.data as Booking[];
}
