import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './utils/store';
import {connectToServer, send} from "./webSocketSlice";
import {
    getOnlineUsers,
    getUser,
    getUserID,
    getUserWrapped,
    setStreamID
} from "./userSlice";
import {handleError} from "./statusSlice";
import {MediaType} from "./model/model";
import {applyVirtualBackground, stopAllVideoEffects} from "./utils/utils";
import CameraProcessor from "camera-processor";
import {UserWrapper} from "./model/UserWrapper";
import {addTracks, exchangeTracks, getRtpSender, resetRTC, stopTracks} from "./rtc";

interface MediaState {
    audio: { [user: string]: boolean }
    video: { [user: string]: boolean }
    screen: { [user: string]: boolean }
    doNotDisturb: { [ user: string]: boolean }
    previousVideo: boolean
    previousAudio: boolean
    cameras: string[]
    microphones: string[]
    speakers: string[]
    selected: {
        camera?: string,
        speaker?: string,
        microphone?: string,
        virtualBackground?: string
    }
    userMedia: boolean // marked obsolete?
}

const initialState: MediaState = {
    audio: {},
    video: {},
    screen: {},
    previousVideo: true,
    previousAudio: true,
    doNotDisturb: {},
    cameras: [],
    microphones: [],
    speakers: [],
    userMedia: false,
    selected: {
        camera: (!!localStorage.getItem("camera")) ? localStorage.getItem("camera")! : undefined,
        microphone: (!!localStorage.getItem("microphone")) ? localStorage.getItem("microphone")! : undefined,
        speaker: (!!localStorage.getItem("speaker")) ? localStorage.getItem("speaker")! : undefined,
        virtualBackground: (!!localStorage.getItem("virtualBackground")) ? localStorage.getItem("virtualBackground")! : "none",
    }
};

let localStream: MediaStream | undefined = undefined // local video and audio
let camera_processor: CameraProcessor | undefined = undefined // if virtual background is applied
let screenStream: MediaStream | undefined = undefined // stream of the display video when shared
let streams: { [key: string]: MediaStream } = {}; // incoming streams of the other users
let mediaDevices: { [key: string]: MediaDeviceInfo } = {}; // media devices

export const mediaSlice = createSlice({
    name: 'rtc',
    initialState,
    reducers: {
        initAllMediaDevices: (state, action: PayloadAction<any>) => {
            state.cameras = action.payload.cameras
            state.microphones = action.payload.microphones
            state.speakers = action.payload.speakers
        },
        toggleAudio: (state, action: PayloadAction<string>) => {
            state.audio[action.payload] = !state.audio[action.payload]
        },
        toggleVideo: (state, action: PayloadAction<string>) => {
            state.video[action.payload] = !state.video[action.payload]
        },
        toggleScreen: (state, action: PayloadAction<string>) => {
            state.screen[action.payload] = !state.screen[action.payload]
        },
        setPrevious: (state, action: PayloadAction<{ kind: MediaType, state: boolean }>) => {
            switch (action.payload.kind) {
                case MediaType.VIDEO:
                    state.previousVideo = action.payload.state
                    break;
                case MediaType.AUDIO:
                    state.previousAudio = action.payload.state
                    break;
            }
        },
        setDoNotDisturb: (state, action: PayloadAction<{ id: string, state: boolean}>) => {
            state.doNotDisturb[action.payload.id] = action.payload.state
        },
        setCamera: (state, action: PayloadAction<string>) => {
            state.selected.camera = action.payload
            localStorage.setItem("camera", action.payload)
        },
        setMicrophone: (state, action: PayloadAction<string>) => {
            state.selected.microphone = action.payload
            localStorage.setItem("microphone", action.payload)

        },
        setSpeaker: (state, action: PayloadAction<string>) => {
            state.selected.speaker = action.payload
            localStorage.setItem("speaker", action.payload)

        },
        setVirtualBackground: (state, action: PayloadAction<string | undefined>) => {
            state.selected.virtualBackground = action.payload

            if (!!action.payload)
                localStorage.setItem("virtualBackground", action.payload)
            else
                localStorage.removeItem("virtualBackground")
        },
        setUserMedia: (state, action: PayloadAction<boolean>) => {
            state.userMedia = action.payload
        },
        turnOnVideo: (state, action: PayloadAction<string>) => {
            state.video[action.payload] = true
        },
        turnOnAudio: (state, action: PayloadAction<string>) => {
            state.audio[action.payload] = true
        },
        setScreen: (state, action: PayloadAction<{ user_id: string, state: boolean }>) => {
            state.screen[action.payload.user_id] = action.payload.state
        },
        setMedia: (state, action: PayloadAction<{ id: string, type: MediaType, state: boolean }>) => {
            if (action.payload.type === MediaType.VIDEO) {
                state.video[action.payload.id] = action.payload.state
            } else if (action.payload.type === MediaType.AUDIO) {
                state.audio[action.payload.id] = action.payload.state
            } else if (action.payload.type === MediaType.SCREEN) {
                state.screen[action.payload.id] = action.payload.state
            }
        },
        resetMedia: (state, action: PayloadAction<string | undefined>) => {
            if (action.payload) {
                delete state.video[action.payload]
                delete state.audio[action.payload]
                delete state.screen[action.payload]
                return
            }

            state.video = {}
            state.audio = {}
            state.screen = {}
        }
    },
});

export const {
    initAllMediaDevices,
    toggleVideo,
    setPrevious,
    toggleAudio,
    setDoNotDisturb,
    toggleScreen,
    setCamera,
    setMicrophone,
    setSpeaker,
    setVirtualBackground,
    setUserMedia,
    turnOnVideo,
    turnOnAudio,
    setScreen,
    setMedia,
    resetMedia
} = mediaSlice.actions;

export const loadAllMediaDevices = (callback?: () => void): AppThunk => (dispatch) => {

    navigator.mediaDevices.enumerateDevices().then(md => {
        const cameras: string[] = []
        const microphones: string[] = []
        const speakers: string[] = []
        md.forEach(d => {
            if (d.deviceId !== "")
                if (d.kind === "audioinput") {
                    microphones.push(d.deviceId)
                    mediaDevices[d.deviceId] = d
                } else if (d.kind === "audiooutput") {
                    speakers.push(d.deviceId)
                    mediaDevices[d.deviceId] = d
                } else if (d.kind === "videoinput") {
                    cameras.push(d.deviceId)
                    mediaDevices[d.deviceId] = d
                }
        })
        dispatch(initAllMediaDevices({
            cameras,
            microphones,
            speakers
        }))
    }).then(callback)

}

export const requestUserMediaAndJoin = (spaceID: string, video: boolean, audio: boolean): AppThunk => (dispatch, getState) => {
    navigator.mediaDevices.getUserMedia(getMediaConstrains(getState(), video, audio)).then((e) => {
        const localClient = getUserID(getState())
        const [ls, cp] = applyVirtualBackground(e, getState().media.selected.virtualBackground, camera_processor)
        dispatch(setStream(getState(), localClient, ls))
        camera_processor = cp

        dispatch(loadAllMediaDevices())
        dispatch(setUserMedia(true))
    }).then(() => {
            // init the video and audio state
            dispatch(setMedia({id: getUserID(getState()), type: MediaType.AUDIO, state: audio}))
            dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: video}))

            dispatch(connectToServer(spaceID))
        }
    ).catch((e) => {
        dispatch(handleError("Unable to get media.", e))
        dispatch(setUserMedia(false))
    })
}

export const toggleUserAudio = (): AppThunk => (dispatch, getState) => {
    dispatch(toggleAudio(getUserID(getState())))

    const state = getState()
    const userID = getUserID(state)
    const audio = getUserWrapped(state).audio

    if (!getStream(state, userID)) {
        dispatch(send({
            type: 'media',
            id: getUserID(getState()),
            media: MediaType.AUDIO,
            event: false
        }));
        return
    }

    // If audio re-enabled
    if (audio) {
        // Replace audio tracks
        dispatch(handleInputChange(false, true))
        dispatch(setMedia({id: getUserID(getState()), type: MediaType.AUDIO, state: true}))
        dispatch(send({
            type: 'media',
            id: getUserID(getState()),
            media: MediaType.AUDIO,
            event: true
        }));
    } else {
        // If disabled, stop all audio tracks
        if (getStream(state, getUserID(state))?.getAudioTracks()[0]) {
            let stream = getStream(state, getUserID(state))
            let oldAudioTrack = stream?.getAudioTracks()[0]
            oldAudioTrack?.stop()

            setStreamID({user_id: userID, type: MediaType.AUDIO, stream_id: undefined})
            dispatch(setMedia({id: getUserID(getState()), type: MediaType.AUDIO, state: false}))
            dispatch(send({
                type: 'media',
                id: getUserID(getState()),
                media: MediaType.AUDIO,
                event: false
            }));
        }
        getOnlineUsers(state).forEach(u => {
            Object.keys(getRtpSender(u.id)).forEach(k => {
                const rtp = getRtpSender(u.id)[k]
                if (rtp.track && rtp.track.kind === 'audio') {
                    rtp.track.stop()
                }
            })
        })
    }
}

export const toggleUserVideo = (): AppThunk => (dispatch, getState) => {
    // get state screen state
    const user: UserWrapper = getUserWrapped(getState())
    const screen: boolean = user.screen

    if (screen) {
        // if the screen was on till now let unshareScreen handle it
        dispatch(unshareScreen(true))
    } else {
        // handle video changes
        if (!user.video) {
            dispatch(shareVideo())
        } else {
            dispatch(stopVideo())
        }
    }
}

// share video
export const shareVideo = (): AppThunk => (dispatch, getState) => {
    dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: true}))
    dispatch(handleInputChange(true, false))
    // tell websocket about video changes
    dispatch(send({
        type: 'media',
        id: getUserID(getState()),
        media: MediaType.VIDEO,
        event: true
    }));
}

// stop but do not set state
export const stopVideo = (): AppThunk => (dispatch, getState) => {
    const state = getState()
    const userID = getUserID(state)

    dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: false}))
    setStreamID({user_id: userID, type: MediaType.VIDEO, stream_id: undefined})
    dispatch(send({
        type: 'media',
        id: getUserID(getState()),
        media: MediaType.VIDEO,
        event: false
    }));

    // Stop all video effects (otherwise camera will remain active)
    stopAllVideoEffects(camera_processor)

    // disable streams if video disabled
    getStream(state, userID)?.getVideoTracks()[0].stop()

    // only kill remote streams if no screen is beeing shared
    if (!getUserWrapped(state).screen) {
        // Disable streams for every one (if nothing is shared)
        stopTracks(state, MediaType.VIDEO)
    }
}

export const toggleUserScreen = (): AppThunk => (dispatch, getState) => {
    if (!getUserWrapped(getState()).screen) {
        // If not enabled yet try to enable the screen sharing
        dispatch(shareScreen())
    } else {
        // If enabled, disable screen sharing
        dispatch(unshareScreen(false))
    }
}

export const shareScreen = (): AppThunk => (dispatch, getState) => {
    const user = getUserWrapped(getState())

    // remember the current video state to know whether to turn on camera or not when sreensharing is turned off
    dispatch(setPrevious({kind: MediaType.VIDEO, state: user.video}))
    navigator.mediaDevices.getDisplayMedia(getScreenSharingConstraints()).then((stream) => {

        // if the video was turned on until now turn it off
        if (user.video) {
            dispatch(toggleVideo(getUserID(getState())))
            dispatch(stopVideo())
        }
        // change the screen state
        dispatch(setScreen({user_id: user.id, state: true}))

        // set stream to class wide variable
        screenStream = stream
        dispatch(setStreamID({
            user_id: getUserID(getState()),
            type: MediaType.SCREEN,
            stream_id: stream.getVideoTracks()[0].id
        }))

        // If screen stream ends stop screen sharing
        stream.getTracks().forEach(t => t.onended = () => {
            dispatch(unshareScreen(false))
        })

        // iterate over all user and replace my video stream with the stream of my screen
        dispatch(exchangeTracks(getScreenStream(getState(), user.id), true, false))

        // tell the websocket that the screen is now shared
        dispatch(send({
            type: 'media',
            id: getUserID(getState()),
            media: MediaType.SCREEN,
            event: true
        }));
    }).catch((e) => {
        dispatch(handleError("Unable to share the screen", e))
    })
}


// unshares the screen and turns the video on or not depending on the previous camera state and whether the call came from
// the camera button
export const unshareScreen = (isFromCamera?: boolean): AppThunk => (dispatch, getState) => {
    // change the screen state
    dispatch(setScreen({user_id: getUserID(getState()), state: false}))

    // change the class wide variable of the stream
    screenStream?.getTracks().forEach(t => t.stop())
    screenStream = undefined
    dispatch(setStreamID({user_id: getUserID(getState()), type: MediaType.SCREEN, stream_id: undefined}))
    dispatch(send({
        type: 'media',
        id: getUserID(getState()),
        media: MediaType.SCREEN,
        event: false
    }));

    // depending on the previousVideo and whether the call came from the camera button start the video or not
    if (getState().media.previousVideo || isFromCamera) {
        dispatch(shareVideo())
    }
}

// Handles the logic for the do not disturb function
export const toggleDoNotDisturb = (): AppThunk => (dispatch, getState) => {
    const state = getState()
    const user = getUserWrapped(state)
    const doNotDisturb = state.media.doNotDisturb

    if (doNotDisturb) {
        // If it is getting turned off --> turn on all previous media

        if (state.media.previousVideo)
            dispatch(toggleUserVideo())
        if (state.media.previousAudio)
            dispatch(toggleUserAudio())

    } else {
        // If it will be turned on --> Turn off all the media
        // Save all previous states
        dispatch(setPrevious({kind: MediaType.AUDIO, state: user.audio}))
        if (!user.screen) {
            // Only save video state if it is not influenced by screen state
            dispatch(setPrevious({kind: MediaType.VIDEO, state: user.video}))
        }

        // Turn off all streams
        if (user.screen)
            dispatch(unshareScreen())

        if (user.audio)
            dispatch(toggleUserAudio())

        if (user.video)
            dispatch(toggleUserVideo())


    }

    dispatch(setDoNotDisturb({ id: user.id, state: !user.doNotDisturb }))

    dispatch(send({
        type: 'media',
        id: getUserID(getState()),
        media: "doNotDisturb",
        event: user.doNotDisturb
    }))
}

export const resetMediaSlice = (): AppThunk => (dispatch, getState) => {
    localStream?.getTracks().forEach(t => t.stop())
    stopAllVideoEffects(camera_processor)
    screenStream?.getTracks().forEach(t => t.stop())

    localStream = undefined
    camera_processor = undefined
    screenStream = undefined

    dispatch(setScreen({user_id: getUserID(getState()), state: false}))
    // dispatch(setUser({...getUser(getState()), online: false}))

    Object.keys(streams).forEach(k => {
        getStream(getState(), k)!.getTracks().forEach(t => {
            t.stop()
            t.enabled = false
            getStream(getState(), k)!.removeTrack(t)
        })
    })

    streams = {}

    resetRTC(getState())
    dispatch(resetMedia())
    dispatch(turnOnVideo(getUserID(getState())))
    dispatch(turnOnAudio(getUserID(getState())))
}

export const setStream = (state: RootState, id: string, stream: MediaStream): AppThunk => dispatch => {
    if (getUser(state).id === id) {
        localStream = stream
    } else {
        streams[id] = stream
    }

    if (stream.getAudioTracks().length > 0) {
        dispatch(setStreamID({
            user_id: id,
            type: MediaType.AUDIO,
            stream_id: stream.getAudioTracks()[0].id
        }));
    }

    if (stream.getVideoTracks().length > 0) {
        dispatch(setStreamID({
            user_id: id,
            type: MediaType.VIDEO,
            stream_id: stream.getVideoTracks()[0].id
        }));
    }
}

export const changeVideoInput = (camera: string): AppThunk => dispatch => {
    dispatch(setCamera(camera))
    dispatch(handleInputChange(true, false))
}

export const changeAudioInput = (microphone: string): AppThunk => dispatch => {
    dispatch(setMicrophone(microphone))
    dispatch(handleInputChange(false, true))

}

export const changeVirtualBackground = (background: string): AppThunk => dispatch => {
    dispatch(setVirtualBackground(background))
    dispatch(handleInputChange(true, false))
}

export const handleInputChange = (video: boolean, audio: boolean): AppThunk => (dispatch, getState) => {
    const state = getState()
    const localClient = getUserID(state)
    const stream = getStream(state, localClient)

    // if stream is undefined that means this method was called via the pre-space settings, therefore, we don't need to
    // add the new stream to any other variable
    if (stream == undefined) return

    navigator.mediaDevices.getUserMedia(getMediaConstrains(state, video, audio)).then((newUserMediaStream) => {
        // This forEach loop updates the local stream
        // We either get video and audio tracks or just one of them depending on the MediaConstraints. We don't need the
        // two boolean during the forEach loop.
        newUserMediaStream.getTracks().forEach(newUserMediaTrack => {
            let isVideo = newUserMediaTrack.kind === "video"
            // apply the virtualBackground to the Stream if it's kind is video
            if (isVideo) {
                let [virtualBackgroundNewUserMediaStream, cp] = applyVirtualBackground(newUserMediaStream,
                    getState().media.selected.virtualBackground, camera_processor)

                newUserMediaTrack = virtualBackgroundNewUserMediaStream.getVideoTracks()[0]
                camera_processor = cp
            }

            const oldMediaStreamTracks: MediaStreamTrack[] | undefined = (isVideo) ? stream?.getVideoTracks() : stream?.getAudioTracks()

            // either add a new stream
            if (oldMediaStreamTracks?.length === 0) {
                stream?.addTrack(newUserMediaTrack)
                dispatch(addTracks(newUserMediaTrack))

                // if we added the track here we don't want to exchange it later
                video = (isVideo) ? false : video
                audio = (!isVideo) ? false : audio

            }// or replace it
            else {
                let oldMediaStreamTrack = oldMediaStreamTracks![0]
                stream?.removeTrack(oldMediaStreamTrack)
                stream?.addTrack(newUserMediaTrack)
                oldMediaStreamTrack.stop()
            }
        })
        // update the local stream variable
        dispatch(setStream(state, localClient, stream))
        // Also tell the other users in the space about the changes
        dispatch(exchangeTracks(stream, video, audio))

        dispatch(setUserMedia(true))
    }).catch(() => {
        dispatch(setUserMedia(false))
        dispatch(handleError("Cannot get user media"))
    })

}

export const changeAudioOutput = (speaker: string): AppThunk => dispatch => {
    dispatch(setSpeaker(speaker))
}

export const getMicrophone = (state: RootState): string => {
    const sel = state.media.selected.microphone
    if (sel && state.media.microphones.find(c => c === sel))
        return sel
    if (state.media.cameras[0])
        return state.media.microphones[0]
    return ""
}

export const getCamera = (state: RootState): string => {
    const sel = state.media.selected.camera
    if (sel && state.media.cameras.find(c => c === sel))
        return sel
    if (state.media.cameras[0])
        return state.media.cameras[0]
    return ""
}

export const getSpeaker = (state: RootState): string => {
    // get selected speaker if available
    // otherwise get first available
    return (state.media.speakers[0]) ? state.media.speakers[0] : ""
}

export const getStream = (state: RootState, id: string): MediaStream | undefined => {
    if (streams[id])
        return streams[id]
    if (state.userState.activeUser.id === id)
        return localStream
}

export const getScreenStream = (state: RootState, id: string) => {
    //if (screenStream[id])
    //    return screenStream[id]
    if (state.userState.activeUser.id === id)
        return screenStream
}

export const getMedia = (state: RootState, type: MediaType, id: string) => {
    if (type === MediaType.VIDEO) {
        return state.media.video[id]
    } else if (type === MediaType.AUDIO) {
        return state.media.audio[id]
    } else if (type === MediaType.SCREEN) {
        return state.media.screen[id]
    }
    return false
}

export const getDoNotDisturb = (state: RootState, id: string) => {
    return state.media.doNotDisturb[id]
}

export const getMediaConstrains = (state: RootState, video: boolean, audio: boolean) => {
    return {
        video: video ? {
            width: {ideal: 320},
            height: {ideal: 320},
            facingMode: "user",
            frameRate: {ideal: 10},
            deviceId: getCamera(state)
        } : undefined,
        audio: audio ? {
            deviceId: getMicrophone(state),
            echoCancellation: true
        } : undefined
    }
}

export const getScreenSharingConstraints = () => {
    return {
        video: {
            width: {ideal: 4096},
            height: {ideal: 2160},
            frameRate: {max: 5},
            mediaSource: 'screen',
        },
        audio: false
    }
}

export const getFreshMediaStream = (state: RootState): Promise<MediaStream> =>
    navigator.mediaDevices.getUserMedia(getMediaConstrains(state, true, true))
export const getMediaDevices = () => mediaDevices
export default mediaSlice.reducer;
