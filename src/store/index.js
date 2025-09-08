import { configureStore } from '@reduxjs/toolkit';
import permissionReducer from '../store/slices/permissionSlices';

export const store = configureStore({
  reducer: {
    permissions: permissionReducer,
    // Add other slices here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;