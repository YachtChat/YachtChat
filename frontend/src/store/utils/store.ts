import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';
import userReducer from '../userSlice';
import webSocketSlice from "../webSocketSlice";
import mediaSlice from "../mediaSlice";
import spaceSlice from "../spaceSlice";
import statusSlice from "../statusSlice";
import authSlice from "../authSlice";
import playgroundSlice from "../playgroundSlice";
import {createBrowserHistory} from 'history'
import {createReduxHistoryContext} from "redux-first-history";

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
  history: createBrowserHistory(),
  //other options if needed
});

export const store = configureStore({
  reducer: {
    router: routerReducer,
    userState: userReducer,
    webSocket: webSocketSlice,
    media: mediaSlice,
    space: spaceSlice,
    status: statusSlice,
    playground: playgroundSlice,
    auth: authSlice,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(routerMiddleware),
});

export const history = createReduxHistory(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
