import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {connectToServer, send, triggerReconnection} from "./webSocketSlice";
import {rtcConfiguration} from "./config";
import {
    getOnlineUsers,
    getUser,
    getUserById,
    getUserByIdWrapped,
    getUserID,
    getUserWrapped,
    handlePositionUpdate,
    setStreamID,
    setUserOffline
} from "./userSlice";
import {handleError} from "./statusSlice";
import {MediaType} from "./model/model";
import {applyVirtualBackground, stopAllVideoEffects} from "./utils";
import CameraProcessor from "camera-processor";
import {UserWrapper} from "./model/UserWrapper";

interface MediaState {
    audio: { [user: string]: boolean }
    video: { [user: string]: boolean }
    screen: { [user: string]: boolean }
    doNotDisturb: boolean
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
    doNotDisturb: false,
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

let rtcConnections: { [key: string]: RTCPeerConnection } = {}; // the connection to handle the connection to the other peer
let rtpSender: { [key: string]: { [key: string]: RTCRtpSender } } = {}; // rtc object that handles stream transmission
let localStream: MediaStream | undefined = undefined // local video and audio
let camera_processor: CameraProcessor | undefined = undefined // if virtual background is applied
let screenStream: MediaStream | undefined = undefined // stream of the display video when shared
let streams: { [key: string]: MediaStream } = {}; // incoming streams of the other users
let mediaDevices: { [key: string]: MediaDeviceInfo } = {}; // media devices
let connectionTimer: { [key: string]: number } = {}; // Connection retry timer
let bytesReceived: Record<string, Record<MediaType, number>> = {}; // Stores bytes received per user

const offerOptions = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
};

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
        setDoNotDisturb: (state, action: PayloadAction<boolean>) => {
            state.doNotDisturb = action.payload
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

export const requestUserMediaAndJoin = (spaceID: string): AppThunk => (dispatch, getState) => {
    navigator.mediaDevices.getUserMedia(getMediaConstrains(getState())).then((e) => {
        const localClient = getUserID(getState())
        const [ls, cp] = applyVirtualBackground(e, getState().media.selected.virtualBackground, camera_processor)
        localStream = ls
        camera_processor = cp

        dispatch(setStreamID({user_id: localClient, type: MediaType.VIDEO, stream_id: ls.getVideoTracks()[0].id}))
        dispatch(setStreamID({user_id: localClient, type: MediaType.AUDIO, stream_id: ls.getAudioTracks()[0].id}))
        dispatch(loadAllMediaDevices())
        dispatch(setUserMedia(true))
    }).then(() =>{
            // init the video and audio state
            dispatch(setMedia({id: getUserID(getState()), type: MediaType.AUDIO, state: true}))
            dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: true}))

           dispatch(connectToServer(spaceID))
    }
    ).catch((e) => {
        console.log(e)
        dispatch(handleError("Unable to get media."))
        dispatch(setUserMedia(false))
    })
}

export const toggleUserAudio = (): AppThunk => (dispatch, getState) => {
    dispatch(toggleAudio(getUserID(getState())))

    const state = getState()
    const userID = getUserID(state)
    const audio = getUserWrapped(state).audio

    if (!getStream(state, userID)) {
        dispatch(send({'type': 'media', 'id': userID, 'media': 'audio', 'event': false}))
        return
    }

    // If audio re-enabled
    if (audio) {
        // Replace audio tracks
        dispatch(handleInputChange('audio'))
        dispatch(setMedia({id: getUserID(getState()), type: MediaType.AUDIO, state: true}))
        dispatch(send({'type': 'media', 'id': userID, 'media': 'audio', 'event': true}))
    } else {
        // If disabled, stop all audio tracks
        if (getStream(state, getUserID(state))?.getAudioTracks()[0]) {
            setStreamID({user_id: userID, type: MediaType.AUDIO, stream_id: undefined})
            getStream(state, getUserID(state))?.getAudioTracks()[0].stop()
            dispatch(setMedia({id: getUserID(getState()), type: MediaType.AUDIO, state: false}))
            dispatch(send({'type': 'media', 'id': userID, 'media': 'audio', 'event': false}))
        }
        getOnlineUsers(state).forEach(u => {
            Object.keys(rtpSender[u.id]).forEach(k => {
                const rtp = rtpSender[u.id][k]
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
        dispatch(toggleVideo(getUserID(getState())))
        // TODO this call should later be deleted because video state is redundant
        dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: getUserWrapped(getState()).video}))

        // handle video changes
        if (user.video) {
            dispatch(handleInputChange('video'))
        } else {
            dispatch(stopVideo())
        }
        // tell websocket about video changes
        dispatch(send({'type': 'media', 'id': getUserID(getState()), 'media': 'video', 'event': user.video}))
    }
}

// stop but do not set state
export const stopVideo = (): AppThunk => (dispatch, getState) => {
    const state = getState()
    const userID = getUserID(state)

    // Stop all video effects (otherwise camera will remain active)
    stopAllVideoEffects(camera_processor)

    // disable streams if video disabled
    getStream(state, userID)?.getVideoTracks()[0].stop()
    setStreamID({user_id: userID, type: MediaType.VIDEO, stream_id: undefined})

    // only kill remote streams if no screen is beeing shared
    if (!getUserWrapped(state).screen) {
        // Disable streams for every one (if nothing is shared)
        getOnlineUsers(state).forEach(u => {
            Object.keys(rtpSender[u.id]).forEach(k => {
                const rtp = rtpSender[u.id][k]
                if (rtp.track && rtp.track.kind === 'video') {
                    rtp.track.stop()
                }
            })
        })
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
            // TODO this call should later be deleted because video state is redundant
            dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: false}))
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
        getOnlineUsers(getState()).forEach(u => {
            if (u.id === getUserID(getState())) return
            rtpSender[u.id]["video"].replaceTrack(stream!.getVideoTracks()[0].clone());
        })

        // tell the weboscket that the screen is now shared
        dispatch(send({'type': 'media', 'id': getUserID(getState()), 'media': 'screen', 'event': true}));

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

    // depending on the previousVideo and whether the call came from the camera button start the video or not
    if (getState().media.previousVideo || isFromCamera) {
        dispatch(toggleVideo(getUserID(getState())))
        dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: true}))
        dispatch(handleInputChange('video'))
        dispatch(send({
            'type': 'media',
            'id': getUserID(getState()),
            'media': 'screen',
            'event': false,
            'changeToVideo': true
        }));
    } else {
        // tell the websocket that the screen is stopped
        dispatch(send({
            'type': 'media',
            'id': getUserID(getState()),
            'media': 'screen',
            'event': false,
            'changeToVideo': false
        }));
        dispatch(setMedia({id: getUserID(getState()), type: MediaType.VIDEO, state: false}))
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

    dispatch(setDoNotDisturb(!doNotDisturb))
}

// Function that will enable spatial audio to a given user
export const sendAudio = (id: string): AppThunk => (dispatch, getState) => {
    if (!getUserWrapped(getState()).audio)
        return
    const rtp = rtpSender[id]["audio"]
    //console.log("Trying to enable audio to ", id)
    if (rtp.track && rtp.track.kind === 'audio') {
        //console.log("Enabled audio")
        rtp.track.enabled = true
    }
    //console.log(getUserID(getState()), " has changed", rtp.track!.kind, "track to", id, "to", rtp.track!.enabled )
}

// Function that will disnable spatial audio to a given user
export const unsendAudio = (id: string): AppThunk => dispatch => {
    const rtp = rtpSender[id]["audio"]
    console.log("Trying not to enable audio to ", id)
    if (rtp.track && rtp.track.kind === 'audio') {
        console.log("Disabled audio")
        rtp.track.enabled = false
    }
    //console.log(getUserID(getState()), " has changed", rtp.track!.kind, "track to", id, "to", rtp.track!.enabled)
}

// User is still in space when his rtcConnection element exist and if he is still online
// this function should be called before every rtcConnection eventlistener to make sure we don't trigger connection when
// the user is not longer in the space
function isUserInSpace(state: RootState, id: string) {
    const user = getUserById(state, id)
    if (!user) return false
    return !!rtcConnections[id] && user.online
}

export const handleRTCEvents = (joinedUserId: string, isCaller?: boolean): AppThunk => (dispatch, getState) => {
    // get client ids
    const clients = getOnlineUsers(getState()).map(k => k.id)
    const localClient: string = getUserID(getState())
    const user = getUserWrapped(getState())
    clients.push(localClient)

    if (Array.isArray(clients) && clients.length > 0) {
        clients.forEach((userId) => {
            // no connection to yourself
            if (localClient === userId) return;
            // no connection to usr that are already connected
            if (!rtcConnections[userId]) {
                // TODO isn't here a connection created from user a to user a
                rtcConnections[userId] = new RTCPeerConnection(rtcConfiguration);
                // TODO what about
                // oniceconnectionstatechange
                // onsignalingstatechange
                // onnegotiationneeded

                rtcConnections[userId].onicecandidate = (event) => {
                    if (!isUserInSpace(getState(), userId)) return
                    if (event.candidate) {
                        console.log(localClient, 'send candidate to ', userId);
                        dispatch(send({
                            type: "signal",
                            target_id: userId,
                            content: {
                                signal_type: 'candidate',
                                candidate: event.candidate
                            }
                        }));
                    }
                };

                rtcConnections[userId].ontrack = (event: RTCTrackEvent) => {
                    if (!isUserInSpace(getState(), userId)) return
                    streams[userId] = event.streams[0]
                    dispatch(setStreamID({
                        user_id: userId,
                        type: (event.track.kind === "audio") ? MediaType.AUDIO : (event.track.kind === "video") ? MediaType.VIDEO : MediaType.SCREEN,
                        stream_id: event.track.id
                    }));
                }

                rtcConnections[userId].onicegatheringstatechange = () => {
                }

                // onnegotiationneeded is called when a track is added to the RTPConncetion.
                // Only the caller needs this eventlistener to send the offer
                // the caller is either the user who recently joined the space or if this is a reconnection try, the user
                // that was the previous caller.
                if (localClient === joinedUserId || isCaller) {
                    rtcConnections[userId].onnegotiationneeded = () => {
                        if (!isUserInSpace(getState(), userId)) return
                        rtcConnections[userId].createOffer(offerOptions).then((description) => {
                            rtcConnections[userId].setLocalDescription(description).then(() => {
                                console.log(localClient, ' Send offer to ', userId);
                                dispatch(send({
                                    type: 'signal',
                                    target_id: userId,
                                    content: {
                                        signal_type: 'sdp',
                                        description: rtcConnections[userId].localDescription,
                                    }
                                }));
                            }).catch(e => dispatch(handleError(e.toString())));
                        });
                    };

                }
                rtpSender[userId] = {}

                if (!getStream(getState(), localClient)) {
                    dispatch(handleError("Could not access media."))
                    return
                }

                let mediaStream = getStream(getState(), localClient)!

                // if screen is beeing shared
                if (user.screen && screenStream) {
                    mediaStream = new MediaStream([
                        localStream!.getAudioTracks()[0],
                        screenStream!.getVideoTracks()[0]
                    ])
                }

                // todo maybe do not send the stream until the connection is established
                mediaStream.getTracks().forEach(track => {
                    rtpSender[userId][track.kind] = rtcConnections[userId].addTrack(track.clone(), getStream(getState(), localClient)!)
                })

                dispatch(setupReconnectionLoop(userId, !!(localClient === joinedUserId || isCaller)))
            }
        });
        dispatch(handlePositionUpdate({id: joinedUserId, position: getUser(getState()).position!}))
    }
}

export const setupReconnectionLoop = (userId: string, isCaller: boolean): AppThunk => (dispatch: any, getState: any) => {
    // Reconnection functionality / stream health check
    if (isCaller) {
        connectionTimer[userId] = setTimeout(() => {
            // delete old reference to timer
            delete connectionTimer[userId];
            // if the connection was not established in time, try to reconnect
            if (!getUserById(getState(), userId).userStream.audio || !getUserById(getState(), userId).userStream.video) {
                // This if statement only yields true if the peer is still in the space and I am still in the Space.
                // if this is true we want to try a reconnection.
                if (getUserById(getState(), userId) !== undefined) {
                    // dispatch(handleError(`Reconnecting to ${getUserById(getState(), userId).firstName}`));
                    dispatch(triggerReconnection(userId));
                }
            } else {
                // Setup reconnection loop after first connection establishment
                // Check every 7sec if stream still streaming
                const interval = setInterval(() => {
                    if (!rtcConnections[userId]) {
                        clearInterval(interval)
                        return
                    }

                    rtcConnections[userId].getStats().then(
                        (report: RTCStatsReport) => {
                            if (!bytesReceived[userId]) {
                                bytesReceived[userId] = {audio: 0, screen: 0, video: 0}
                            }
                            const br = bytesReceived
                            const user = getUserByIdWrapped(getState(), userId)
                            report.forEach(k => {
                                if (k.type === "inbound-rtp" && k.kind === "video") {
                                    if (br['video'] === k.bytesReceived && user.video) {
                                        console.log(`${user.firstName} does not send any video data.`)
                                        clearInterval(interval)
                                        // dispatch(handleError(`Reconnecting to ${getUserById(getState(), userId).firstName}`));
                                        dispatch(triggerReconnection(userId));
                                    }
                                    bytesReceived[userId][MediaType.VIDEO] = k.bytesReceived
                                } else if (k.type === "inbound-rtp" && k.kind === "audio") {
                                    if (br['audio'] === k.bytesReceived && user.audio) {
                                        console.log(`${user.firstName} does not send any video data.`)
                                        clearInterval(interval)
                                        // dispatch(handleError(`Reconnecting to ${getUserById(getState(), userId).firstName}`));
                                        dispatch(triggerReconnection(userId));
                                    }
                                    bytesReceived[userId][MediaType.AUDIO] = k.bytesReceived
                                }
                                // Possibly check also outbound streams and recreate own audio/video streams if necessary
                            })
                        }
                    )
                }, 7000)
            }
        }, 3000);
    }
}

export const handleCandidate = (candidate: any, fromId: string): AppThunk => (dispatch: any, getState: any) => {
    if (!isUserInSpace(getState(), fromId)) return
    rtcConnections[fromId].addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e.stack));
    let connection_type = new RTCIceCandidate(candidate)
    if (connection_type.type !== null) {
        switch (connection_type.type) {
            case "relay":
                //console.log(connection_type.address + " uses TURN")
                break

            case "srflx":
                //console.log(connection_type.address + " uses STUN")
                break

            default:
                console.log("NO TURN SERVER USED by: " + connection_type.address + " as " + connection_type.type)
                break

        }
    }
}

export const handleSdp = (description: any, fromId: string): AppThunk => (dispatch: any, getState: any) => {
    if (!isUserInSpace(getState(), fromId)) return
    if (!!description) {
        const clientId: string = getUserID(getState());
        if (clientId === fromId)
            return

        rtcConnections[fromId].setRemoteDescription(new RTCSessionDescription(description))
            .then(() => {
                if (description.type === 'offer') {
                    rtcConnections[fromId].createAnswer()
                        .then((desc) => {
                            rtcConnections[fromId].setLocalDescription(desc).then(() => {
                                console.log(clientId, ' Send answer to ', fromId);
                                // This replaces the socket.emit function
                                dispatch(send({
                                    type: "signal",
                                    target_id: fromId,
                                    content: {
                                        signal_type: "sdp",
                                        description: rtcConnections[fromId].localDescription
                                    }
                                }));
                            });
                        })
                        .catch(
                            (error) => {
                                console.log(error)
                                dispatch(handleError("RTC Answer could not be created."))
                            });
                }
            })
            .catch(
                (error) => {
                    console.log(error)
                    dispatch(handleError("RTC remote description could not be set."))
                });
    } else {
        dispatch(handleError("RTC Description was not set"))
    }
}

export const disconnectUser = (id: string): AppThunk => (dispatch, getState) => {
    if (!isUserInSpace(getState(), id)) return
    rtcConnections[id].close()
    delete rtcConnections[id]
    dispatch(setUserOffline(id))
    dispatch(resetMedia(id))
    // clear potential timer which was set up for the user that just left
    if (connectionTimer[id]) {
        clearTimeout(connectionTimer[id]);
        delete connectionTimer[id];
    }
    if (!rtpSender[id]) return
    Object.keys(rtpSender[id]).forEach(k => rtpSender[id][k].track?.stop())
    delete rtpSender[id]
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

    // clear all timer when we are leaving the space
    Object.keys(connectionTimer).forEach(userId => {
        clearTimeout(connectionTimer[userId]);
    });
    connectionTimer = {};

    Object.keys(streams).forEach(k => {
        getStream(getState(), k)!.getTracks().forEach(t => {
            t.stop()
            t.enabled = false
            getStream(getState(), k)!.removeTrack(t)
        })
    })


    getOnlineUsers(getState()).forEach(u => {
        Object.keys(rtpSender[u.id]).forEach(k => rtpSender[u.id][k].track?.stop())
        rtcConnections[u.id].close()
    })
    streams = {}
    rtcConnections = {}
    rtpSender = {}

    dispatch(resetMedia())
    dispatch(turnOnVideo(getUserID(getState())))
    dispatch(turnOnAudio(getUserID(getState())))
}

export const changeVideoInput = (camera: string): AppThunk => dispatch => {
    dispatch(setCamera(camera))
    dispatch(handleInputChange("video"))
}

export const changeAudioInput = (microphone: string): AppThunk => dispatch => {
    dispatch(setMicrophone(microphone))
    dispatch(handleInputChange("audio"))

}

export const changeVirtualBackground = (background: string): AppThunk => dispatch => {
    dispatch(setVirtualBackground(background))
    dispatch(handleInputChange("video"))
}

export const handleInputChange = (type?: 'video' | 'audio'): AppThunk => (dispatch, getState) => {
    const state = getState()
    const user = getUserWrapped(state)
    const localClient = getUserID(state)
    const oldStream = getStream(state, localClient)

    // If true all tracks have to be replaced otherwise just of type
    const replaceAllTracks = user.video && user.audio

    navigator.mediaDevices.getUserMedia(getMediaConstrains(state, (replaceAllTracks) ? undefined : type)).then((e) => {
        // If type is not set or no localStream available reset the whole stream object
        const [ls, cp] = applyVirtualBackground(e, getState().media.selected.virtualBackground, camera_processor)
        localStream = ls
        camera_processor = cp

        if (replaceAllTracks || type === "video")
            dispatch(setStreamID({user_id: localClient, type: MediaType.VIDEO, stream_id: ls.getVideoTracks()[0].id}))
        if (replaceAllTracks || type === "audio")
            dispatch(setStreamID({user_id: localClient, type: MediaType.AUDIO, stream_id: ls.getAudioTracks()[0].id}))

        getStream(state, localClient)!.getTracks().forEach(s => {
            // replace only stream of type and only if the video/audio aint muted
            if ((!type || type === s.kind) &&
                ((s.kind === 'audio' && user.audio) || (s.kind === 'video' && user.video))) {
                getOnlineUsers(state).forEach(u => {
                    Object.keys(rtpSender[u.id]).forEach(k => {
                        const rs = rtpSender[u.id][k]
                        if (rs.track && rs.track.kind === s.kind) {
                            const clone = s.clone()
                            if (clone.kind === 'audio')
                                clone.enabled = !!u.inProximity
                            rs.track.stop()
                            rs.replaceTrack(clone)
                        }
                    })
                })
            }
        })
        oldStream!.getTracks().forEach(t => t.stop())
        dispatch(setUserMedia(true))
    }).catch(() => {
        dispatch(setUserMedia(false))
        dispatch(handleError("Cannot get user media"))
    })

}

export const changeAudioOutput = (speaker: string): AppThunk => dispatch => {
    dispatch(setSpeaker(speaker))
}

export const getRtcConnection = (state: RootState, id: number) => rtcConnections[id];
export const getMediaConstrains = (state: RootState, type?: string) => {
    return {
        video: (type !== 'audio') ? {
            width: {ideal: 320},
            height: {ideal: 320},
            facingMode: "user",
            frameRate: {ideal: 10},
            deviceId: getCamera(state)
        } : undefined,
        audio: (type !== 'video') ? {
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
export const getStream = (state: RootState, id: string) => {
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

export const getFreshMediaStream = (state: RootState): Promise<MediaStream> =>
    navigator.mediaDevices.getUserMedia(getMediaConstrains(state))
export const getMediaDevices = () => mediaDevices
export default mediaSlice.reducer;
