import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import userReducer from './userSlice';
import webSocketSlice from "./connectionSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    userState: userReducer,
    webSocket: webSocketSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
