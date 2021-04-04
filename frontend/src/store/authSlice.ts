import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from './store';
import axios from "axios";
import {setName, setUserId} from './userSlice';

interface AuthState {
    loggedIn: boolean
    token: string | null
    authFlow: boolean
}

const initialState: AuthState = {
    loggedIn: false,
    authFlow: false,
    token: localStorage.getItem("token")
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
            localStorage.setItem("token", action.payload)
        },
        authFlowReady: (state) => {
            state.authFlow = true
        }
    },
});

export const {
    setLogin,
    setToken,
    authFlowReady
} = authSlice.actions;

export const initAuth = (error: string): AppThunk => (dispatch, getState) => {

}

export const checkAuth = (id_token?: string,): AppThunk => (dispatch, getState) => {

    if (id_token) {
        dispatch(setToken(id_token))
    }

    const existingToken = getState().auth.token
    if (existingToken && existingToken !== "") {
        axios.post("https://oauth2.googleapis.com/tokeninfo?id_token=" + existingToken).then(response => {
            dispatch(setLogin(true))
            dispatch(setName(response.data.name))
            console.log(response.data.name)
            console.log(response.data.name)
            dispatch(setUserId(response.data.sub))
            // load user info from there
        }).then(() =>
            dispatch(authFlowReady())
        ).catch(() => {
            dispatch(logout())
            dispatch(authFlowReady())
            // redirect to get a new token
        })
    } else {
        dispatch(authFlowReady())
    }
}

export const logout = (): AppThunk => (dispatch, getState) => {
    dispatch(setToken(""))
    localStorage.removeItem("token")
    dispatch(setLogin(false))
}

export default authSlice.reducer;
