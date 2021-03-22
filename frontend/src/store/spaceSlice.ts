import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Space} from "./models";

interface SpaceState {
    spaces: { [key: number]: Space }
}

const initialState: SpaceState = {
    spaces: {}
}

export const spaceSlice = createSlice({
    name: "space",
    initialState,
    reducers: {
        setSpaces: (state, action: PayloadAction<{ [key: number]: Space }>) => {
            const spaces: { [key: number]: Space } = {}

            Object.keys(action.payload).forEach(k => {
                const id = Number(k)
                    spaces[id] = action.payload[id]
            })
            state.spaces = spaces
        },
    }
});

export const {
    setSpaces
} = spaceSlice.actions;

export default spaceSlice.reducer;