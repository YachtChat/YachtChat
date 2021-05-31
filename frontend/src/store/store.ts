import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import userReducer from './userSlice';
import webSocketSlice from "./webSocketSlice";
import rtcSlice from "./rtcSlice";
import spaceSlice from "./spaceSlice";
import statusSlice from "./statusSlice";
import authSlice from "./authSlice";
import playgroundSlice from "./playgroundSlice";
import {connectRouter, routerMiddleware} from 'connected-react-router';
import {createBrowserHistory} from 'history'

export const history = createBrowserHistory()

export const store = configureStore({
  reducer: {
    router: connectRouter<unknown>(history),
    userState: userReducer,
    webSocket: webSocketSlice,
    rtc: rtcSlice,
    space: spaceSlice,
    status: statusSlice,
    playground: playgroundSlice,
    auth: authSlice,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(routerMiddleware(history))
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
