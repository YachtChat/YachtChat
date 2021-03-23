import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import userReducer from './userSlice';
import webSocketSlice from "./connectionSlice";
import rtcSlice from "./rtcSlice";
import spaceSlice from "./spaceSlice";
import statusSlice from "./statusSlice";

export const store = configureStore({
  reducer: {
    userState: userReducer,
    webSocket: webSocketSlice,
    rtc: rtcSlice,
    space: spaceSlice,
    status: statusSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
