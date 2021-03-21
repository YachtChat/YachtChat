import {createSlice} from '@reduxjs/toolkit';
import {AppThunk, RootState} from './store';
import {send} from "./connectionSlice";
import {rtcConfiguration} from "./stunServerConfig";
import {getUser, getUserID, gotRemoteStream} from "./userSlice";
import {handleError} from "./errorSlice";

interface RTCState {
    muted: boolean
    video: boolean
}

const initialState: RTCState = {
    muted: false,
    video: true
};

let rtcConnections: { [key: string]: RTCPeerConnection } = {};
let streams: { [key: string]: MediaStream } = {};

const offerOptions = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
};

const mediaConstrains = {
    video: {width: 320, height: 320, facingMode: "user", frameRate: 1.0},
    audio: true
}

export const rtcSlice = createSlice({
    name: 'rtc',
    initialState,
    reducers: {
        toggleMute: (state) => {
            state.muted = !state.muted
        },
        toggleVideo: (state) => {
            state.video = !state.video
        }
    },
});

export const {
    toggleVideo,
    toggleMute
} = rtcSlice.actions;

export const requestUserMediaAndJoin = (): AppThunk => (dispatch, getState) => {
    navigator.mediaDevices.getUserMedia(mediaConstrains).then((e) => {
        const localClient = getUserID(getState())
        streams[localClient] = e
        dispatch(gotRemoteStream(localClient))
    }).then(() =>
        dispatch(send({
            type: "join"
        }))
    )
}

export const mute = (): AppThunk => (dispatch, getState) => {
    dispatch(toggleMute())
    streams[getState().userState.activeUser.id].getAudioTracks()[0].enabled = !getState().rtc.muted
}

export const displayVideo = (): AppThunk => (dispatch, getState) => {
    dispatch(toggleVideo())
    streams[getState().userState.activeUser.id].getVideoTracks()[0].enabled = getState().rtc.video
}

export const sendAudio = (id: number): AppThunk => (dispatch, getState) => {
    // const localClient = getState().webSocket.id
    // streams[localClient].getAudioTracks().forEach(track => {
    //     const r = rtcConnections[id].addTrack(track, streams[localClient]);
    //     r.replaceTrack(track).
    // })
}

export const unsendAudio = (id: number): AppThunk => (dispatch, getState) => {
    // const localClient = getState().webSocket.id
    // streams[localClient].getAudioTracks().forEach(track => {
    //     rtcConnections[id].removeTrack();
    // })
}

export const handleRTCEvents = (joinedUserId: number, count: number): AppThunk => (dispatch, getState) => {
    // get client ids
    const clients = Object.keys(getState().userState.otherUsers).map(k => Number(k))
    const localClient: number = getUserID(getState())
    clients.push(localClient)

    if (Array.isArray(clients) && clients.length > 0) {
        clients.forEach((userId) => {
            if (!rtcConnections[userId]) {
                rtcConnections[userId] = new RTCPeerConnection(rtcConfiguration);
                rtcConnections[userId].onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log(localClient, ' Send candidate to ', userId);
                        setTimeout(() => {
                            console.log('hello');
                        }, 1000);
                        dispatch(send({
                            type: "signaling",
                            target: userId,
                            signal_type: 'candidate',
                            candidate: event.candidate
                        }));
                    }
                };

                rtcConnections[userId].ontrack = (event: RTCTrackEvent) => {
                    console.log(`On track event handler of ${localClient} triggered with streams:`);
                    console.dir(event.streams);
                    streams[userId] = event.streams[0]
                    dispatch(gotRemoteStream(userId));
                    console.log("I HAVE A TRACK");
                }

                streams[localClient].getTracks().forEach(track => {
                    rtcConnections[userId].addTrack(track, streams[localClient]);
                })
            }
        });

        if (count >= 2) {
            rtcConnections[joinedUserId].createOffer(offerOptions).then((description) => {
                rtcConnections[joinedUserId].setLocalDescription(description).then(() => {
                    console.log(localClient, ' Send offer to ', joinedUserId);
                    setTimeout(() => {
                        console.log('hello');
                    }, 1000);
                    dispatch(send({
                        type: 'signaling',
                        target: joinedUserId,
                        description: rtcConnections[joinedUserId].localDescription,
                        signal_type: 'sdp'
                    }));
                }).catch(handleError);
            });
        }
    }
}

export const handleCandidate = (candidate: any, fromId: number): AppThunk => (dispatch: any, getState: any) => {
    rtcConnections[fromId].addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e.stack));
}

export const handleSdp = (description: any, fromId: number): AppThunk => (dispatch: any, getState: any) => {
    console.log("Start handleSdp with description:");
    console.dir(description);
    if (!!description) {
        const clientId: number = getUserID(getState());

        console.log(clientId, ' Receive sdp from ', fromId);
        rtcConnections[fromId].setRemoteDescription(new RTCSessionDescription(description))
            .then(() => {
                if (description.type === 'offer') {
                    rtcConnections[fromId].createAnswer()
                        .then((desc) => {
                            rtcConnections[fromId].setLocalDescription(desc).then(() => {
                                console.log(clientId, ' Send answer to ', fromId);

                                // This replaces the socket.emit function
                                dispatch(send({
                                    type: "signaling",
                                    signal_type: "sdp",
                                    target: fromId,
                                    description: rtcConnections[fromId].localDescription
                                }));
                            });
                        })
                        .catch(dispatch(handleError("RTC Answer could not be created.")));
                }
            })
            .catch(dispatch(handleError("RTC remote description could not be set.")));
    } else {
        dispatch(handleError("RTC Description was not set"))
    }
}

export const destroySession = () => {
    Object.keys(streams).forEach(k => {
        streams[k].getTracks().forEach(t => {
            t.enabled = false
            streams[k].removeTrack(t)
        })
    })

    streams = {}

    Object.keys(rtcConnections).forEach(k => {
        rtcConnections[k].close()
    })

    rtcConnections = {}
}

export const getRtcConnection = (state: RootState, id: number) => rtcConnections[id];
export const getStream = (id: number) => streams[id]
export default rtcSlice.reducer;
