import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from './store';
import posthog from "posthog-js";

interface StatusState {
    error?: string
    success?: string
}

const initialState: StatusState = {};

export const statusSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        setSuccess: (state, action: PayloadAction<string>) => {
            state.success = action.payload;
        },
        resetError: (state) => {
            state.error = undefined;
        },
        resetSuccess: (state) => {
            state.success = undefined;
        }
    },
});

export const {
    setError,
    setSuccess,
    resetError,
    resetSuccess
} = statusSlice.actions;

export const handleError = (error: string, e?: any): AppThunk => (dispatch) => {
    console.error(error, e)
    dispatch(setError(error))
    setTimeout(() => dispatch(resetError()), 2000)
    posthog.capture("[ERROR] " + error)
}

export const handleSuccess = (success: string): AppThunk => (dispatch) => {
    console.log(success)
    dispatch(setSuccess(success))
    setTimeout(() => dispatch(resetSuccess()), 2000)
}

export const handleInfo = (info: string): AppThunk => () => {
    console.log(info)
    posthog.capture("[INFO] " + info)
}

export default statusSlice.reducer;
