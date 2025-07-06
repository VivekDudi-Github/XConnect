import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount++;
    },
    markAllAsRead: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    clearNotification: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    } ,
    removeNotification: (state, action) => {
      const {_id } = action.payload;
      state.notifications = state.notifications.filter(n => n._id !== _id);
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    }
  },
});

export const { addNotification, markAllAsRead, clearNotification , removeNotification} = notificationSlice.actions;
export default notificationSlice;
