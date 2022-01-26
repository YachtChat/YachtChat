import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from './utils/store';
import posthog from "posthog-js";
import {StatusMessage, StatusType} from "./model/model";

interface StatusState {
    messages: StatusMessage[]
    counter: number
}

const initialState: StatusState = {
    messages: [],
    counter: 0
};

export const statusSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        addStatusMessage: (state, action: PayloadAction<StatusMessage>) => {
            state.messages.push({...action.payload, id: state.counter})
            state.counter = state.counter + 1

            if (state.messages.length > 4)
                console.log(state.messages.splice(0,1))
        },
        removeStatusMessage: (state, action: PayloadAction<number>) => {
            const index = state.messages.findIndex(m => m.id === action.payload)
            if (index > -1) {
                state.messages.splice(index, 1);
            }
        }
    },
});

export const {
    addStatusMessage,
    removeStatusMessage
} = statusSlice.actions;

export const handleError = (error: string, e?: any): AppThunk => (dispatch, getState) => {
    console.error(error, e)
    const id = getState().status.counter
    dispatch(addStatusMessage({ type: StatusType.error, id: 0, message: error}))
    setTimeout(() => dispatch(removeStatusMessage(id)), 6000)
    posthog.capture("error", { message: error, error: e.toString() })
}

export const handleSuccess = (success: string): AppThunk => (dispatch, getState) => {
    console.log(success)
    const id = getState().status.counter
    dispatch(addStatusMessage({ type: StatusType.success, id: 0, message: success}))
    setTimeout(() => dispatch(removeStatusMessage(id)), 6000)

}

export const handleInfo = (info: string): AppThunk => () => {
    console.log(info)
    posthog.capture("info", {message: info})
}

export default statusSlice.reducer;
