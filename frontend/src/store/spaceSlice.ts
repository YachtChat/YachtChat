import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Space} from "./models";
import {AppThunk} from "./store";
import axios from "axios";
import {handleError} from "./statusSlice";

const SPACES_URL:string = "space.alphabibber.com";//| undefined = process.env.REACT_APP_SPACES_URL;

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

export const requestSpaces = ():AppThunk => dispatch =>  {
    if(!SPACES_URL){
        dispatch(handleError("No websocket url defined for this environment"));
        return;
    }
    axios.get("https://" + SPACES_URL + "/spaces/").then(response => {
        dispatch(setSpaces(response.data))
    }).catch(e => console.log(e.trace))
}

export const {
    setSpaces
} = spaceSlice.actions;

export default spaceSlice.reducer;