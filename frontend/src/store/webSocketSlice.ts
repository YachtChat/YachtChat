import {createSlice} from '@reduxjs/toolkit';
import {AppThunk} from './utils/store';
import {UserCoordinates, UserPayload} from "./model/model";
import {
    getOnlineUsersWrapped,
    getUserById,
    getUserID, getUserWrapped,
    handleMessage,
    handlePositionUpdate,
    handleSpaceUser,
    handleSpaceUsers,
    removeUser, setInRange,
} from "./userSlice";
import {handleError, handleSuccess} from "./statusSlice";
import {mediaSlice, requestUserMediaAndJoin, setDoNotDisturb, setMedia} from "./mediaSlice";
import {SOCKET_PORT, SOCKET_URL} from "./utils/config";
import {getToken} from "./authSlice";
import {requestSpaces} from "./spaceSlice";
import {destroySession} from "./destroySession";
import {disconnectUser, handleCandidate, handleSdp} from "./rtc";
import {sendNotification} from "./utils/notifications";
import {isOnline} from "./utils/utils";
import posthog from "posthog-js";
import {initPlayground} from "./playgroundSlice";

interface WebSocketState {
    connected: boolean
}

let socket: WebSocket | null = null;
let heartBeat: number | null = null;

const initialState: WebSocketState = {
    connected: false,
};

export const webSocketSlice = createSlice({
    name: 'webSocket',
    initialState,
    reducers: {
        connect: (state) => {
            state.connected = true
        },
        disconnect: (state) => {
            state.connected = false
        }
    },
});

export const {connect, disconnect} = webSocketSlice.actions;

export const connectToServer = (spaceID: string): AppThunk => (dispatch, getState) => {
    if (!SOCKET_URL) {
        dispatch(handleError("No websocket url defined for this environment"));
        return;
    }

    console.log("Try to connect to", spaceID)

    if (!SOCKET_PORT)
        socket = new WebSocket("wss://" + SOCKET_URL + "/space/" + spaceID);
    else {
        socket = new WebSocket("ws://" + SOCKET_URL + ":" + SOCKET_PORT + "/space/" + spaceID);
    }


    socket.onopen = () => {
        dispatch(connect())
        dispatch(requestLogin())
        heartBeat = window.setInterval(() => {
            dispatch(send({type: "ping"}));
        }, 5000);
    }

    socket.onerror = e => {
        // console.log(e)
        // dispatch(disconnect())
        // dispatch(reconnectToWs())
        dispatch(handleError("An error with the server connection occurred", e))
    };

    socket.onclose = (e) => {
        dispatch(disconnect())
        console.log(e)
        if (!e.wasClean || e.code !== 1000 || !!getState().space.joinedSpace)
            dispatch(reconnectToWs())
        else
            dispatch(destroySession(false))
    }

    socket.onmessage = function (msg) {
        // console.log("Got message", msg);
        const data = JSON.parse(msg.data);
        // if (data.type !== "position_change")
        // console.log("Object", data);
        const joinedSpace = !!getState().space.joinedSpace
        switch (data.type) {
            case "login":
                dispatch(handleLogin(data.success, spaceID, data.users));
                break;
            case "new_user":
                if (joinedSpace) {
                    dispatch(handleSpaceUser(data.id, data.position, data.video, data.audio));
                }
                break;
            case "reconnection":
                if (joinedSpace) {
                    dispatch(handleSpaceUser(data.id, data.position, data.video, data.audio, data.isCaller))
                }
                break;
            case "leave":
                if (joinedSpace)
                    dispatch(disconnectUser(data.id))
                break;
            case "position":
                if (joinedSpace && data.id !== getUserID(getState()))
                    dispatch(handlePositionUpdate(data));
                break;
            case "media":
                if (joinedSpace)
                    dispatch(setMedia({id: data.id, type: data.medium, state: data.event}));
                break;
            case "doNotDisturb":
                if (joinedSpace)
                    dispatch(setDoNotDisturb({id: data.id, state: data.event}));
                break;
            case "message":
                if (!joinedSpace) break;
                dispatch(handleMessage(data.content, data.sender_id))
                break;
            case "range":
                dispatch(setInRange(data))
                if (getUserWrapped(getState()).doNotDisturb && data.event) {
                    const user = getUserById(getState(), data.id)
                    const message = `${user.firstName} wants to talk to you.`
                    if (getState().playground.inBackground) {
                        sendNotification(getState(), message, user.profile_image)
                    } else {
                        dispatch(handleSuccess(message))
                    }
                    dispatch(sendMessage("I'm in do not disturb mode. I cannot hear you. I'll be back right away."))
                }
                break;
            case "kick":
                if (!joinedSpace) break;
                if (getState().userState.activeUser.id === data.id) {
                    dispatch(destroySession(true))
                    dispatch(requestSpaces())
                } else {
                    const user = getUserById(getState(), data.id)
                    dispatch(handleSuccess(`Successfully kicked ${user.firstName} ${user.lastName}`))
                    dispatch(disconnectUser(data.id))
                    dispatch(removeUser(data.id))
                }
                break;
            case "signal":
                if (!joinedSpace)
                    break;
                const fromId: string = data.sender_id;
                if (fromId !== getUserID(getState())) {
                    // TODO check this random wait
                    const signal_content = data.content
                    switch (signal_content.signal_type) {
                        case "candidate":
                            dispatch(handleCandidate(signal_content.candidate, fromId))
                            break;
                        case "sdp":
                            // TODO timeout here is not good, because a candidate would already be send form the caller
                            dispatch(handleSdp(signal_content.description, fromId))
                            break;
                        default:
                            dispatch(handleError("Unknown signaling type."))
                    }
                }
                break;
            default:
                dispatch(handleError("Unknown server event"))
                break
        }
    };
};
export const reconnectToWs = (): AppThunk => (dispatch, getState) => {
    if (heartBeat) clearInterval(heartBeat)

    // If not part of a space
    if (!getState().space.joinedSpace)
        return

    const relogin = setInterval(() => {
        // Only try to reconnect if tab is in focus
        posthog.capture("Reconnect", { description: "Frontend to space " +  getState().space.joinedSpace })

        isOnline().then(() => {
            clearInterval(relogin)
            let space_id = getState().space.joinedSpace
            let user = getUserWrapped(getState())

            dispatch(destroySession(false))
            dispatch(initPlayground())
            dispatch(requestUserMediaAndJoin(space_id!, user.video, user.audio))

        })
    }, 5000)
    //else
    //dispatch(destroySession(true))
}

export const sendMessage = (message: string): AppThunk => (dispatch, getState) => {
    getOnlineUsersWrapped(getState()).forEach(u => {
        if (u.inProximity) {
            dispatch(send({
                type: "message",
                target_id: u.id,
                content: message
            }))
        }
    })
    dispatch(handleMessage(message, getUserID(getState())))
}

export const send = (message: { [key: string]: any }): AppThunk => (dispatch, getState) => {
    //attach the other peer username to our messages
    const msgObj = {
        ...message,
        id: getUserID(getState()),
    }

    if (socket !== null)
        socket.send(JSON.stringify(msgObj));
}

export const requestLogin = (): AppThunk => (dispatch, getState) => {
    const user = getUserWrapped(getState())
    getToken(getState()).then(token =>
        dispatch(send({
            type: "login",
            token: token,
            user_id: getState().userState.activeUser.id,
            video: user.video,
            microphone: user.audio
        }))
    ).catch(() => dispatch(destroySession()))
}

export const sendLogout = (returnHome?: boolean): AppThunk => (dispatch) => {
    dispatch(send({type: "leave"}))
    dispatch(destroySession(returnHome))
}

export const sendPosition = (position: UserCoordinates): AppThunk => (dispatch) => {
    dispatch(send({
        type: "position",
        position,
    }));
}

export const handleLogin = (success: boolean, spaceid: string, users: Set<UserPayload>): AppThunk => dispatch => {
    if (!success) {
        dispatch(handleError("Join failed. Try again later."))
        dispatch(destroySession(true))
    } else {
        dispatch(handleSuccess("Connected to space. Connecting to other users..."))
        dispatch(handleSpaceUsers(spaceid, users))
    }
}

export const resetWebsocket = (): AppThunk => dispatch => {
    if (socket) {
        socket?.close()
        dispatch(disconnect())
        socket = null
        if (heartBeat) {
            clearInterval(heartBeat);
            heartBeat = null
        }
    }
}

export const triggerReconnection = (id: string): AppThunk => (dispatch => {
    dispatch(send({
        type: "reconnection",
        user_id: id
    }))
})

export default webSocketSlice.reducer;
