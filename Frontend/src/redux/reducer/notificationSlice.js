import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  isNotificationfetched : false , 
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount++;
    },
    addMultipleNotifications: (state, action) => {
      const newNotifications = action.payload;
      state.notifications = [...newNotifications, ...state.notifications];
      state.unreadCount += newNotifications.filter(n => !n.isRead).length;
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
    } ,
    changeIsNotificationfetched : (state , action) => {
      state.isNotificationfetched = action.payload ;
    } ,
  },
});

export const { addNotification, changeIsNotificationfetched ,  markAllAsRead, clearNotification , addMultipleNotifications ,  removeNotification} = notificationSlice.actions;
export default notificationSlice;
