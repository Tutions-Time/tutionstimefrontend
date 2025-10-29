import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getTutorSlots, Slot } from "@/services/availability";

type State = {
  slots: Slot[];
  selectedSlot: Slot | null;
  loading: boolean;
  error: string | null;
};

const initialState: State = {
  slots: [],
  selectedSlot: null,
  loading: false,
  error: null,
};

export const fetchSlotsThunk = createAsyncThunk<
  Slot[],
  string,
  { rejectValue: string }
>("availability/fetchSlots", async (tutorId, { rejectWithValue }) => {
  try {
    return await getTutorSlots(tutorId);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to load slots");
  }
});

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    selectSlot(state, action: PayloadAction<Slot | null>) {
      state.selectedSlot = action.payload;
    },
    clearSlots(state) {
      state.slots = [];
      state.selectedSlot = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSlotsThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchSlotsThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.slots = a.payload;
      })
      .addCase(fetchSlotsThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Error";
      });
  },
});

export const { selectSlot, clearSlots } = availabilitySlice.actions;
export default availabilitySlice.reducer;
