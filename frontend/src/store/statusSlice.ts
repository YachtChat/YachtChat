import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from './store';

interface StatusState {
    error?: string
}

const initialState: StatusState = {};

export const statusSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        }
    },
});

export const {
    setError,
} = statusSlice.actions;

export const handleError = (error: string): AppThunk => (dispatch, getState) => {

}

export default statusSlice.reducer;
