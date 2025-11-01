import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createBooking, getMyBookings, type Booking, type CreateBookingPayload } from "@/services/bookings";

type State = {
  bookings: Booking[];
  current?: Booking | null;
  loading: boolean;
  error?: string | null;
  lastAction?: "create" | "fetch" | null;
};

const initialState: State = {
  bookings: [],
  current: null,
  loading: false,
  error: null,
  lastAction: null,
};

export const createBookingThunk = createAsyncThunk<
  Booking,
  CreateBookingPayload,
  { rejectValue: string }
>("booking/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await createBooking(payload);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to create booking");
  }
});

export const getBookingsThunk = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>("booking/getAll", async (_, { rejectWithValue }) => {
  try {
    return await getMyBookings();
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to load bookings");
  }
});

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingState(state) {
      state.current = null;
      state.error = null;
      state.lastAction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // create
      .addCase(createBookingThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.lastAction = "create";
      })
      .addCase(createBookingThunk.fulfilled, (s, a: PayloadAction<Booking>) => {
        s.loading = false;
        s.current = a.payload;
        s.bookings.unshift(a.payload);
      })
      .addCase(createBookingThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Error";
      })
      // fetch
      .addCase(getBookingsThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.lastAction = "fetch";
      })
      .addCase(getBookingsThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.bookings = a.payload;
      })
      .addCase(getBookingsThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Error";
      });
  },
});

export const { clearBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
