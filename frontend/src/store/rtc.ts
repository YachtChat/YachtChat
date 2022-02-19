import {AppThunk, RootState} from "./utils/store";
import {
    getOnlineUsers, getOnlineUsersWrapped,
    getUser,
    getUserById, getUserByIdWrapped,
    getUserID,
    getUserWrapped,
    handlePositionUpdate,
    setUserOffline
} from "./userSlice";
import {rtcConfiguration} from "./utils/config";
import {send, triggerReconnection} from "./webSocketSlice";
import {MediaType} from "./model/model";
import {handleError} from "./statusSlice";
import {getScreenStream, getStream, resetMedia, setStream} from "./mediaSlice";
import {sendNotification} from "./utils/notifications";
import {UserWrapper} from "./model/UserWrapper";

let rtcConnections: { [key: string]: RTCPeerConnection } = {}; // the connection to handle the connection to the other peer
let rtpSender: { [key: string]: { [key: string]: RTCRtpSender } } = {}; // rtc object that handles stream transmission
let bytesReceived: Record<string, Record<MediaType, number>> = {}; // Stores bytes received per user
let connectionTimer: { [key: string]: number } = {}; // Connection retry timer

const offerOptions = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
};

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
                    dispatch(setStream(getState(), userId, event.streams[0]))
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
                if (user.screen && user.getScreenStream()) {
                    mediaStream = new MediaStream([
                        user.stream!.getAudioTracks()[0],
                        user.getScreenStream()!.getVideoTracks()[0]
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

// Function that will enable spatial audio to a given user
export const sendAudio = (id: string): AppThunk => (dispatch, getState) => {
    if (!getUserWrapped(getState()).audio)
        return
    const rtp = rtpSender[id]["audio"]
    //console.log("Trying to enable audio to ", id)
    if (rtp.track && rtp.track.kind === 'audio') {
        //console.log("Enabled audio")
        rtp.track.enabled = true
        const user = getUserById(getState(), id)
        if (getState().playground.inBackground)
            sendNotification(getState(), `${user.firstName} can now hear you`, user.profile_image,
                // Actions currently not supported
                // [{
                //     action: "mute",
                //     title: "Mute yourself",
                //     onClick: () => {
                //         window.alert("ALERT")
                //     }
                // }]
            )
    }
    //console.log(getUserID(getState()), " has changed", rtp.track!.kind, "track to", id, "to", rtp.track!.enabled )
}

export const localUserIsSendingAudioTo = (id: string) => {
    return rtpSender[id]["audio"].track!.enabled
}

// Function that will enable spatial video to a given user
export const sendVideo = (id: string): AppThunk => (dispatch, getState) => {
    const user: UserWrapper = getUserWrapped(getState());

    if (!user.screen && !user.video)
        return

    const rtp = rtpSender[id]["video"]

    if (rtp.track && rtp.track.kind === 'video') {
        rtp.track.stop()

        if (user.video)
            rtp.replaceTrack(getStream(getState(), user.id)?.getVideoTracks()[0]?.clone() ?? null)
        if (user.screen) {
            rtp.replaceTrack(getScreenStream(getState(), user.id)?.getVideoTracks()[0]?.clone() ?? null)
        }

        const target_user = getUserById(getState(), id)
        if (getState().playground.inBackground)
            sendNotification(getState(), `${target_user.firstName} can now see ${getUserWrapped(getState()).screen ? "your screen" : "you"}`, target_user.profile_image,
                // Actions currently not supported
                // [{
                //     action: "mute",
                //     title: "Mute yourself",
                //     onClick: () => {
                //         window.alert("ALERT")
                //     }
                // }]
            )
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

// Function that will disnable spatial audio to a given user
export const unsendVideo = (id: string): AppThunk => dispatch => {
    const rtp = rtpSender[id]["video"]
    console.log("Trying not disable video to ", id)
    if (rtp.track && rtp.track.kind === 'video') {
        rtp.track.onended = null
        rtp.track.stop()
        // rtp.replaceTrack(new MediaStreamTrack())
    }
}

// User is still in space when his rtcConnection element exist and if he is still online
// this function should be called before every rtcConnection eventlistener to make sure we don't trigger connection when
// the user is not longer in the space
function isUserInSpace(state: RootState, id: string) {
    const user = getUserById(state, id)
    if (!user) return false
    return !!rtcConnections[id] && user.online
}

export const setupReconnectionLoop = (userId: string, isCaller: boolean): AppThunk => (dispatch, getState) => {
    // Reconnection functionality / stream health check
    if (isCaller) {
        connectionTimer[userId] = window.setTimeout(() => {
            // delete old reference to timer
            delete connectionTimer[userId];
            // if the connection was not established in time, try to reconnect
            const user = getUserByIdWrapped(getState(), userId)
            if ((user.audio && !user.userStream.audio) || (user.video && !user.userStream.video)) {
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

                    

                    // If user is not connected to websocket do not try to reconnect, since it would be hopeless
                    if (!getState().webSocket.connected)
                        return

                    rtcConnections[userId].getStats().then(
                        (report: RTCStatsReport) => {
                            if (!bytesReceived[userId]) {
                                bytesReceived[userId] = {audio: 0, screen: 0, video: 0}
                            }
                            const br = bytesReceived
                            report.forEach(k => {
                                if (k.type === "inbound-rtp" && k.kind === "video") {
                                    if (br['video'] === k.bytesReceived && user.video) {
                                        console.log(`${user.firstName} does not send any video data. Reconnecting.`)
                                        clearInterval(interval)
                                        // dispatch(handleError(`Reconnecting to ${getUserById(getState(), userId).firstName}`));
                                        dispatch(triggerReconnection(userId));
                                    }
                                    bytesReceived[userId][MediaType.VIDEO] = k.bytesReceived
                                } else if (k.type === "inbound-rtp" && k.kind === "audio") {
                                    if (br['audio'] === k.bytesReceived && user.audio) {
                                        console.log(`${user.firstName} does not send any audio data. Reconnecting.`)
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

/**
 * Adds MediaStreamTrack to each online User. Does not care about the type of the MediaStreamTrack. Should only be called
 * if there is no track of the tracks kind set for all users.
 * @param newMediaStreamTrack
 */
export const addTracks = (newMediaStreamTrack: MediaStreamTrack): AppThunk => (dispatch, getState) => {
    const state = getState()
    const localId = getUserID(state)
    const users = getOnlineUsers(state)
    users.forEach(u => {
        rtpSender[u.id][newMediaStreamTrack.kind] = rtcConnections[u.id].addTrack(newMediaStreamTrack.clone(), getStream(state, localId)!)
    })
}

export const exchangeTracks = (stream: MediaStream | undefined, video: boolean, audio: boolean): AppThunk => (dispatch, getState) => {
    const state = getState()
    const user = getUserWrapped(state)

    stream?.getTracks().forEach(s => {
        // replace only stream of type and only if the video/audio aint muted
        if (((s.kind === "video" && video) && (user.video || user.screen)) ||
            ((s.kind === "audio" && audio) && (user.audio))) {

            getOnlineUsersWrapped(state).forEach(u => {
                Object.keys(rtpSender[u.id]).forEach(k => {
                    const rs = rtpSender[u.id][k]
                    if (rs.track && rs.track.kind === s.kind) {
                        const clone = s.clone()
                        if (clone.kind === 'audio')
                            clone.enabled = !!u.inProximity
                        rs.track.stop()

                        // do not exchange if the user shares screen but other user is not in proximity
                        if (user.screen && !getUserByIdWrapped(state, u.id).inProximity) {
                            return
                        }

                        rs.replaceTrack(clone)
                    }
                })
            })
        }
    })
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

export const resetRTC = (state: RootState) => {
    // clear all timer when we are leaving the space
    Object.keys(connectionTimer).forEach(userId => {
        clearTimeout(connectionTimer[userId]);
    });
    connectionTimer = {};

    getOnlineUsers(state).forEach(u => {
        Object.keys(rtpSender[u.id]).forEach(k => rtpSender[u.id][k].track?.stop())
        rtcConnections[u.id].close()
    })
    rtcConnections = {}
    rtpSender = {}

    bytesReceived = {}; // Stores bytes received per user
}

export const stopTracks = (state: RootState, media: MediaType) => {
    getOnlineUsers(state).forEach(u => {
        Object.keys(rtpSender[u.id]).forEach(k => {
            const rtp = rtpSender[u.id][k]
            if (rtp.track && rtp.track.kind === media.toString()) {
                rtp.track.stop()
            }
        })
    })
}

export const getRtcConnection = (id: string) => rtcConnections[id];
export const getRtpSender = (id: string) => rtpSender[id];