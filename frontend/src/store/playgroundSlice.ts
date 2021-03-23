import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {PlaygroundOffset} from "./models";

interface SpaceState {
    offset: PlaygroundOffset
}

const initialState: SpaceState = {
    offset: {
        x: window.innerHeight / 2,
        y: window.innerHeight / 2,
        scale: 0,
    }
}

export const spaceSlice = createSlice({
    name: "playground",
    initialState,
    reducers: {
        movePlayground: (state, action: PayloadAction<PlaygroundOffset>) => {
            state.offset = action.payload
        },
        scalePlayground: (state, action: PayloadAction<number>) => {
            state.offset.scale = action.payload
        }
    }
});

export const {
    movePlayground,
    scalePlayground
} = spaceSlice.actions;

export default spaceSlice.reducer;