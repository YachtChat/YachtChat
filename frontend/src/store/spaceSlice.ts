import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Space} from "./models";
import {AppThunk} from "./store";
import axios from "axios";

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
    axios.get("https://spaces.chat.alphabibber.com/spaces/").then(response => {
        dispatch(setSpaces(response.data))
    }).catch(e => console.log(e.trace))


}

export const {
    setSpaces
} = spaceSlice.actions;

export default spaceSlice.reducer;