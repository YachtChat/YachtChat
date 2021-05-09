import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Space} from "./models";
import {AppThunk} from "./store";
import axios from "axios";
import {handleError, handleSuccess} from "./statusSlice";
import {SPACES_URL} from "./config";
import {getToken} from "./authSlice";

interface SpaceState {
    spaces: Space[]
}

const initialState: SpaceState = {
    spaces: []
}

export const spaceSlice = createSlice({
    name: "space",
    initialState,
    reducers: {
        setSpaces: (state, action: PayloadAction<Space[]>) => {
            state.spaces = action.payload
        },
    }
});

export const {
    setSpaces
} = spaceSlice.actions;

export const requestSpaces = (): AppThunk => (dispatch, getState) => {
    if (!SPACES_URL) {
        dispatch(handleError("No spaces url defined for this environment"));
        return;
    }
    getToken(getState()).then(token =>
        axios.get("https://" + SPACES_URL + "/api/v1/spaces/", getHeaders(token)).then(response => {
            dispatch(setSpaces(response.data))
        }).catch(e => console.log(e.trace))
    )
}

export const createSpace = (name: string): AppThunk => (dispatch, getState) => {
    axios.post("https://" + SPACES_URL + "/createSpaces/", getHeaders(getState().auth.token!)).then(response => {
        dispatch(handleSuccess("Space successfully created"))
        dispatch(requestSpaces())
    }).catch(e => {
        dispatch(handleError("Space could not be created"))
        console.log(e.trace)
    })
}


const getHeaders = (token: string): any => {
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
}

export default spaceSlice.reducer
