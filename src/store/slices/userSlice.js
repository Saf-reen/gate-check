import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  access: null,
  refresh: null,
  user: null,
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.user = action.payload.user;
    },
    clearCredentials: (state) => {
      state.access = null;
      state.refresh = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearCredentials } = userSlice.actions;
export default userSlice.reducer;
