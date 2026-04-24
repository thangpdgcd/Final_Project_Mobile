import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/redux/slices/authSlice';
import { productsReducer } from '@/redux/slices/productsSlice';
import { ordersReducer } from '@/redux/slices/ordersSlice';
import { notificationsReducer } from '@/redux/slices/notificationsSlice';
import { profileReducer } from '@/redux/slices/profileSlice';
import { cartReducer } from '@/redux/slices/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
    profile: profileReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/hydrate/fulfilled'],
        ignoredPaths: ['auth.user', 'profile.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

