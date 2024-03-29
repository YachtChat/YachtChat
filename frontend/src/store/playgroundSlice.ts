import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {CameraMode, MediaType, PlaygroundOffset, User} from "./model/model";
import {AppThunk, RootState} from "./utils/store";
import {requestSpaces} from "./spaceSlice";
import {getUser, getUserWrapped, userProportion} from "./userSlice";
import {setPrevious, toggleUserVideo, unshareScreen} from "./mediaSlice";
import {clearAllNotifications} from "./utils/notifications";
import posthog from "posthog-js";

interface PlaygroundState {
    offset: PlaygroundOffset
    videoInAvatar: boolean
    cameraMode: CameraMode,
    showVolumeIndicators: boolean
    inBackground: boolean // if the application is in background
    notifications: boolean // if the application is in background
}

const initScale = (1.0 / 1080) * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight)
let prevHeight = window.innerHeight;
let prevWidth = window.innerWidth;

const initialState: PlaygroundState = {
    offset: {
        x: -window.innerWidth / 2 * (1 / initScale),
        y: -window.innerHeight / 2 * (1 / initScale),
        // The scale is normed to 1080 pixels, but will increase when the screen is bigger
        scale: initScale,
        trueScale: 1.0,
    },
    notifications: localStorage.getItem("notifications") !== "false",
    videoInAvatar: localStorage.getItem("videoInAvatar") !== "false", // Video only shown in sidebar or in avatar
    showVolumeIndicators: localStorage.getItem("showVolumeIndicators") === "true", // Video only shown in sidebar or in avatar
    cameraMode: localStorage.getItem("cameraMode") !== CameraMode.Automatically.toString() ?
        CameraMode.Manual : CameraMode.Automatically, // Video only shown in sidebar or in avatar
    inBackground: false
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
        },
        setVideoInAvatar: (state, action: PayloadAction<boolean>) => {
            state.videoInAvatar = action.payload
            localStorage.setItem("videoInAvatar", action.payload.toString())
            posthog.capture("videoInAvatar-setting", {$set: {videoInAvatar: action.payload}})
        },
        setShowVolumeIndicators: (state, action: PayloadAction<boolean>) => {
            state.showVolumeIndicators = action.payload
            localStorage.setItem("showVolumeIndicators", action.payload.toString())
            posthog.capture("showVolumeIndicators-setting", {$set: {showVolumeIndicator: action.payload}})
        },
        setNotifications: (state, action: PayloadAction<boolean>) => {
            state.notifications = action.payload
            localStorage.setItem("notifications", action.payload.toString())
            posthog.capture("notification", {$set: {notifications: action.payload}})
        },
        setCameraMode: (state, action: PayloadAction<CameraMode>) => {
            state.cameraMode = action.payload
            localStorage.setItem("cameraMode", action.payload.toString())
        },
        setInBackground: (state, action: PayloadAction<boolean>) => {
            state.inBackground = action.payload
        },
    }
});

export const {
    movePlayground,
    scalePlayground,
    resetPlayground,
    setVideoInAvatar,
    setCameraMode,
    setShowVolumeIndicators,
    setInBackground,
    setNotifications
} = spaceSlice.actions;

export const initPlayground = (): AppThunk => (dispatch, getState) => {
    window.addEventListener("resize", (): void => {
        const newScale = (getState().playground.offset.trueScale / 1080) * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight)
        const offset = getState().playground.offset

        // change the scale
        dispatch(scalePlayground(
            newScale
        ))

        // delta (change in width)
        const d = {
            x: (window.innerWidth - prevWidth),
            y: (window.innerHeight - prevHeight)
        }

        // old scale
        const d_os = {x: d.x / offset.scale, y: d.y / offset.scale}
        // new scale
        const d_ns = {x: d.x / offset.scale, y: d.y / offset.scale}
        // d delta (change in position --> delta on old scale substracted by delta of new scale = total change)
        const d_d = {x: d_os.x - d_ns.x, y: d_os.y - d_ns.y}

        dispatch(movePlayground({
            ...getState().playground.offset,
            x: offset.x - d_d.x / 2,
            //x: offset.x - ((window.innerWidth > window.innerHeight) ? d_d.x / 2 : d_ns.x/2),
            y: offset.y - d_d.y / 2
            //y: offset.y - ((window.innerWidth < window.innerHeight) ? d_d.y / 2 : d_ns.y/2)
        }))

        prevHeight = window.innerHeight
        prevWidth = window.innerWidth
    })
    dispatch(requestSpaces())
    dispatch(setupCameraMode(getState().playground.cameraMode))
    window.addEventListener("focus", () => {
        dispatch(setInBackground(false))
        clearAllNotifications()
    })
    window.addEventListener("blur", () => {
        dispatch(setInBackground(true))
    })
}

export const centerUser = (user?: User): AppThunk => (dispatch, getState) => {
    let userPos;
    if (user)
        userPos = user.position!
    else
        userPos = getUser(getState()).position!

    const offset = getState().playground.offset
    dispatch(movePlayground({
        ...offset,
        x: userPos.x - window.innerWidth / offset.scale / 2,
        y: userPos.y - window.innerHeight / offset.scale / 2
    }))
}

export const handleZoom = (z: number, cx?: number, cy?: number): AppThunk => (dispatch, getState) => {
    const state = getState()
    const scale = state.playground.offset.scale
    const scaledZoom = state.playground.offset.scale + (z / 1080 * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight))
    const userPos = state.userState.activeUser.position!
    const offX = state.playground.offset.x
    const offY = state.playground.offset.y

    // center of zoom
    const centerX = cx ? cx / getState().playground.offset.scale : (userPos.x - offX)
    const centerY = cy ? cy / getState().playground.offset.scale : (userPos.y - offY)

    const x = offX + ((centerX) * (scaledZoom) - (centerX) * scale) / (scaledZoom)
    const y = offY + ((centerY) * (scaledZoom) - (centerY) * scale) / (scaledZoom)


    dispatch(movePlayground({
        x,
        y,
        scale: scaledZoom,
        trueScale: state.playground.offset.trueScale + z
    }))
}

export const setScale = (z: number, cx?: number, cy?: number): AppThunk => (dispatch, getState) => {
    const state = getState()
    const scale = state.playground.offset.scale
    const scaledZoom = (z / 1080 * ((window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight))
    const userPos = state.userState.activeUser.position!
    const offX = state.playground.offset.x
    const offY = state.playground.offset.y

    // center of zoom
    const centerX = cx ? cx : (userPos.x - offX)
    const centerY = cy ? cy : (userPos.y - offY)

    const x = offX + ((centerX) * (scaledZoom) - (centerX) * scale) / (scaledZoom)
    const y = offY + ((centerY) * (scaledZoom) - (centerY) * scale) / (scaledZoom)


    dispatch(movePlayground({
        x,
        y,
        scale: scaledZoom,
        trueScale: z
    }))
}

export const isUserOutOfBounds = (state: RootState): boolean => {
    if (!getUser(state).position)
        return true
    const x_screen = getUser(state).position!.x - state.playground.offset.x
    const y_screen = getUser(state).position!.y - state.playground.offset.y
    const scale = state.playground.offset.scale

    // Overflows
    const left = x_screen * scale - userProportion / 2 < 0
    const right = x_screen * scale + userProportion / 2 > window.innerWidth
    const top = y_screen * scale - userProportion / 2 < 0
    const bottom = y_screen * scale + userProportion / 2 > window.innerHeight

    return left || right || top || bottom
}

export const setupCameraMode = (mode: CameraMode): AppThunk => (dispatch, getState) => {

    dispatch(setCameraMode(mode))

    const user = getUserWrapped(getState())

    switch (mode) {
        case CameraMode.Automatically:
            window.onblur = () => {
                if (user.screen) {
                    dispatch(unshareScreen())
                }
                if (user.video) {
                    dispatch(toggleUserVideo())
                    dispatch(setPrevious({kind: MediaType.VIDEO, state: true}))
                } else {
                    dispatch(setPrevious({kind: MediaType.VIDEO, state: false}))
                }
            }
            window.onfocus = () => {
                if (getState().media.previousVideo &&
                    !getState().media.doNotDisturb &&
                    !user.screen &&
                    !user.video) {
                    dispatch(toggleUserVideo())
                }
            }
            break;
        case CameraMode.Manual:
            window.onblur = () => {
            }
            window.onfocus = () => {
            }
            break;
    }
}

export default spaceSlice.reducer;