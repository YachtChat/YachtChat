import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {PlaygroundOffset} from "./models";

interface SpaceState {
    offset: PlaygroundOffset
}

const initialState: SpaceState = {
    offset: {
        x: -window.innerWidth / 2,
        y: -window.innerHeight / 2,
        scale: 1.0,
    }
}

export const spaceSlice = createSlice({
    name: "playground",
    initialState,
    reducers: {
        movePlayground: (state, action: PayloadAction<PlaygroundOffset>) => {
            if (action.payload.scale <= 2.0 && action.payload.scale >= 0.5)
                state.offset = action.payload
        },
        scalePlayground: (state, action: PayloadAction<number>) => {
            if (action.payload <= 2.0 && action.payload >= 0.5)
                state.offset.scale = action.payload
        }
    }
});

export const {
    movePlayground,
    scalePlayground
} = spaceSlice.actions;

export default spaceSlice.reducer;