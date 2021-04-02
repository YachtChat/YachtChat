import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from './store';

interface AuthState {
    loggedIn: boolean
    token: string
}

const initialState: AuthState = {
    loggedIn: true,
    token: "jwt"
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLogin: (state, action: PayloadAction<boolean>) => {
            state.loggedIn = action.payload;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
    },
});

export const {
    setLogin,
    setToken
} = authSlice.actions;

export const initAuth = (error: string): AppThunk => (dispatch, getState) => {

}


export default authSlice.reducer;
