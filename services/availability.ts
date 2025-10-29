import api from "@/lib/api";

export type Slot = {
  _id: string;
  tutorId: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  isBooked?: boolean;
};

export type SlotInput = {
  startTime: string; // ISO
  endTime: string;   // ISO
};

export async function getTutorSlots(tutorId: string): Promise<Slot[]> {
  const res = await api.get(`/availability/${tutorId}`);
  return res.data?.data || [];
}

export async function setTutorSlots(slots: SlotInput[]) {
  const res = await api.post("/availability/me", { slots });
  return res.data;
}


