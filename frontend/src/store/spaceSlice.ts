import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Space} from "./models";
import {AppThunk} from "./store";
import axios from "axios";
import {handleError} from "./statusSlice";
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

export const requestSpaces = (): AppThunk => (dispatch, getState) => {
    if (!SPACES_URL) {
        dispatch(handleError("No spaces url defined for this environment"));
        return;
    }
    getToken(getState()).then(token =>
        axios.get("https://" + SPACES_URL + "/spaces/", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            dispatch(setSpaces(response.data))
        }).catch(e => console.log(e.trace))
    )
}

export const {
    setSpaces
} = spaceSlice.actions;

export default spaceSlice.reducer;