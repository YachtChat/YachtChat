import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from './store';

interface ErrorState {
    error?: string
}

const initialState: ErrorState = {};

export const userSlice = createSlice({
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
} = userSlice.actions;

export const handleError = (error: string): AppThunk => (dispatch, getState) => {

}

export default userSlice.reducer;
