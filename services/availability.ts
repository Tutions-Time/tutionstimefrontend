import api from "@/lib/api";

export type Slot = {
  _id?: string;
  tutorId?: string;
  startTime: string;  // ISO format
  endTime: string;    // ISO format
  slotType: "demo" | "regular";
  isBooked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SlotInput = {
  startTime: string;  // ISO
  endTime: string;    // ISO
  slotType: "demo" | "regular";
};

/**
 * 🧠 Get all available slots for a given tutor
 * Supports optional filtering like ?type=demo or ?type=regular
 */
export async function getTutorSlots(
  tutorId: string,
  type: "demo" | "regular" = "demo"
): Promise<Slot[]> {
  try {
    const res = await api.get(`/availability/${tutorId}?type=${type}`);
    return res.data?.data || [];
  } catch (err) {
    console.error("Error fetching tutor slots:", err);
    throw err;
  }
}

/**
 * 🧠 Tutor: Set or update multiple slots at once
 * Payload shape expected by backend:
 * {
 *   slots: [{ startTime, endTime, slotType }]
 * }
 */
export async function setTutorSlots(payload: { slots: SlotInput[] }) {
  try {
    const res = await api.post("/availability/me", payload);
    return res.data; // { success, message, data }
  } catch (err) {
    console.error("Error setting tutor slots:", err);
    throw err;
  }
}

/**
 * 🧠 Tutor: Get their own slots (for dashboard)
 */
export async function getMySlots(): Promise<Slot[]> {
  try {
    const res = await api.get("/availability/me");
    return res.data?.data || [];
  } catch (err) {
    console.error("Error fetching my slots:", err);
    throw err;
  }
}

export async function deleteSlot(slotId: string) {
  try {
    const res = await api.delete(`/availability/${slotId}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting slot:", err);
    throw err;
  }
}

