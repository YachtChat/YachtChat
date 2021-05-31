import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Space} from "./models";
import {AppThunk} from "./store";
import axios from "axios";
import {handleError, handleSuccess} from "./statusSlice";
import {SPACES_URL} from "./config";
import {getHeaders} from "./authSlice";

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
        addSpace: (state, action: PayloadAction<Space>) => {
            state.spaces.push(action.payload)
        },
    }
});

export const {
    setSpaces,
    addSpace
} = spaceSlice.actions;

export const requestSpaces = (): AppThunk => (dispatch, getState) => {
    if (!SPACES_URL) {
        dispatch(handleError("No spaces url defined for this environment"));
        return;
    }
    getHeaders(getState()).then(header =>
        axios.get("https://" + SPACES_URL + "/api/v1/spaces/", header).then(response => {
            dispatch(setSpaces(response.data))
        }).catch(e => console.log(e.trace))
    )
}

export const createSpace = (name: string): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(header =>
        axios.post("https://" + SPACES_URL + "/api/v1/spaces/", {name}, header).then(response => {
            dispatch(handleSuccess("Space successfully created"))
            dispatch(addSpace(response.data))

        }).catch(e => {
            console.log("https://" + SPACES_URL + "/api/v1/spaces/?name=" + name)
            dispatch(handleError("Space could not be created"))
            console.log(e.trace)
        })
    )
}

export const deleteSpace = (id: string): AppThunk => (dispatch, getState) => {
    getHeaders(getState()).then(header =>
        axios.delete("https://" + SPACES_URL + "/api/v1/spaces/" + id + "/", header).then(response => {
            dispatch(handleSuccess("Space successfully deleted"))
            dispatch(requestSpaces())
        }).catch(e => {
            console.log("https://" + SPACES_URL + "/api/v1/spaces/" + id)
            dispatch(handleError("Space could not be deleted"))
            console.log(e.trace)
        })
    )
}

export default spaceSlice.reducer
