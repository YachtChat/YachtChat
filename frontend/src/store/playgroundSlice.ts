import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {PlaygroundOffset} from "./models";
import {AppThunk} from "./store";

interface SpaceState {
    offset: PlaygroundOffset
}

const initScale = (1.0 / 1080) * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight)
let prevHeight = window.innerHeight;
let prevWidth = window.innerWidth;

const initialState: SpaceState = {
    offset: {
        x: -window.innerWidth / 2 * (1 / initScale),
        y: -window.innerHeight / 2 * (1 / initScale),
        // The scale is normed to 1080 pixels, but will increase when the screen is bigger
        scale: initScale,
        trueScale: 1.0
    }
}

export const spaceSlice = createSlice({
    name: "playground",
    initialState,
    reducers: {
        movePlayground: (state, action: PayloadAction<PlaygroundOffset>) => {
            // The scale is normed to 1080 pixels, but will increase when the screen is bigger
            const ub = 4.0 / 1080 * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight)
            // The scale is normed to 1080 pixels, but will increase when the screen is bigger
            const lb = 0.5 / 1080 * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight)

            if (action.payload.scale <= ub && action.payload.scale >= lb)
                state.offset = action.payload
        },
        scalePlayground: (state, action: PayloadAction<number>) => {
            state.offset.scale = action.payload
        },
        resetPlayground: (state) => {
            state.offset = initialState.offset
        }
    }
});

export const {
    movePlayground,
    scalePlayground,
    resetPlayground
} = spaceSlice.actions;

export const initPlayground = (): AppThunk => (dispatch, getState) => {
    window.addEventListener("resize", (): void => {
        const newScale = (getState().playground.offset.trueScale / 1080) * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight)

        dispatch(scalePlayground(
            newScale
        ))

        const offset = getState().playground.offset

        dispatch(movePlayground({
            ...offset,
            x: offset.x - (window.innerWidth - prevWidth) / offset.scale / 2,
            y: offset.y - (window.innerHeight - prevHeight) / offset.scale / 2
        }))

        prevHeight = window.innerHeight
        prevWidth = window.innerWidth
    })
}

export const centerUser = (): AppThunk => (dispatch, getState) => {
    const userPos = getState().userState.activeUser.position!
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
    const userPos = state.userState.activeUser.position!
    const offX = state.playground.offset.x
    const offY = state.playground.offset.y
    const x = offX + ((userPos.x - offX) * (scale + z) - (userPos.x - offX) * scale) / (scale + z)
    const y = offY + ((userPos.y - offY) * (scale + z) - (userPos.y - offY) * scale) / (scale + z)

    const scaledZoom = state.playground.offset.scale + (z / 1080 * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight))

    dispatch(movePlayground({
        x,
        y,
        scale: scaledZoom,
        trueScale: state.playground.offset.trueScale + z
    }))
}

export default spaceSlice.reducer;