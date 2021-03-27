import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {PlaygroundOffset} from "./models";
import {AppThunk} from "./store";

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
        },
    }
});

export const {
    movePlayground,
    scalePlayground
} = spaceSlice.actions;

export const centerUser = (): AppThunk => (dispatch, getState) => {
    const userPos = getState().userState.activeUser.position
    const offset = getState().playground.offset
    dispatch(movePlayground({
        ...offset,
        x: userPos.x - window.innerWidth / offset.scale / 2,
        y: userPos.y - window.innerHeight / offset.scale / 2
    }))
}

export const handleZoom = (z: number): AppThunk => (dispatch, getState) => {
    const state = getState()
    const scale = state.playground.offset.scale
    const userPos = state.userState.activeUser.position
    const offX = state.playground.offset.x
    const offY = state.playground.offset.y
    const x = offX + ((userPos.x - offX) * (scale + z) - (userPos.x - offX) * scale) / (scale + z)
    const y = offY + ((userPos.y - offY) * (scale + z) - (userPos.y - offY) * scale) / (scale + z)
    dispatch(movePlayground({
        x,
        y,
        scale: state.playground.offset.scale + z
    }))
}

export default spaceSlice.reducer;