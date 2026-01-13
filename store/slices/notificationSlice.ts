import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationState = {
  unreadCount: number;
};

const initialState: NotificationState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload);
    },
    incrementUnread: (state, action: PayloadAction<number | undefined>) => {
      state.unreadCount += action.payload ?? 1;
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { setUnreadCount, incrementUnread, resetUnread } =
  notificationSlice.actions;
export default notificationSlice.reducer;
