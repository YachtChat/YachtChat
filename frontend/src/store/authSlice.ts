import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {setName, setUserId} from './userSlice';
import keycloak from "./keycloak";
import {AxiosRequestConfig} from "axios";

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

export const checkAuth = (id_token?: string): AppThunk => (dispatch, getState) => {

    keycloak.init({
        onLoad: 'login-required',
    }).then((auth) => {
        if (auth) {
            keycloak.updateToken(30).then(() =>
                dispatch(setToken(keycloak.token!)) // TODO: to be set to keycloak.token
            ).catch(() => keycloak.login())
        }

        const existingToken = getState().auth.token
        if (existingToken && existingToken !== "") {
            dispatch(setLogin(auth)) // TODO: to be set to keycloak.authenticated

            // @ts-ignore
            dispatch(setName(keycloak.tokenParsed!.name))

            // @ts-ignore
            dispatch(setUserId(keycloak.tokenParsed!.sub))
        } else {
            dispatch(authFlowReady())
            keycloak.login()
        }
    })
        .then(() => dispatch(authFlowReady()))
        .catch(() => {
            dispatch(logout())
            dispatch(authFlowReady())
            // redirect to get a new token
        })

}

export const logout = (): AppThunk => (dispatch, getState) => {
    dispatch(setToken(""))
    localStorage.removeItem("token")
    dispatch(setLogin(false))
    keycloak.logout()
}

export const getToken = (state: RootState): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        keycloak.updateToken(30).then(() =>
            resolve(keycloak.token!)
        ).catch(() =>
            keycloak.login()
        )
    })
}

export const getHeaders = (state: RootState): Promise<AxiosRequestConfig> => {
    return new Promise<AxiosRequestConfig>((resolve, reject) => {
        getToken(state).then(token =>
            resolve({
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        ).catch(() =>
            reject()
        )
    })
}

export default authSlice.reducer;
