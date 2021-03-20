import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from './store';

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

export const handleError = (error: string): AppThunk => (dispatch, getState) => {
    console.error(error)
    dispatch(setError(error))
    setTimeout(() => dispatch(resetError()), 2000)
}

export const handleSuccess = (success: string): AppThunk => (dispatch, getState) => {
    console.log(success)
    dispatch(setSuccess(success))
    setTimeout(() => dispatch(resetSuccess()), 2000)
}

export default statusSlice.reducer;