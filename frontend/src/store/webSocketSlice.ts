import {createSlice} from '@reduxjs/toolkit';
import {AppThunk} from './store';
import {UserCoordinates, UserPayload} from "./models";
import {
    getOnlineUsers,
    getUser,
    getUserID,
    gotRemoteStream,
    handleMessage,
    handlePositionUpdate,
    handleSpaceUser,
    handleSpaceUsers,
    setMedia
} from "./userSlice";
import {handleError, handleSuccess} from "./statusSlice";
import {destroySession, disconnectUser, handleCandidate, handleRTCEvents, handleSdp} from "./rtcSlice";
import {SOCKET_PORT, SOCKET_URL} from "./config";
import {getToken} from "./authSlice";

interface WebSocketState {
    connected: boolean
    joinedRoom: boolean
}

let socket: WebSocket | null = null;

const initialState: WebSocketState = {
    connected: false,
    joinedRoom: false,
};

export const webSocketSlice = createSlice({
    name: 'webSocket',
    initialState,
    reducers: {
        connect: (state) => {
            state.connected = true
        },
        joined: (state) => {
            state.joinedRoom = true
        },
        leftRoom: (state) => {
            state.joinedRoom = false
        },
        disconnect: (state) => {
            state.connected = false
        }
    },
});

export const {connect, disconnect, joined, leftRoom} = webSocketSlice.actions;

export const connectToServer = (spaceID: string): AppThunk => (dispatch, getState) => {
    if (!SOCKET_URL) {
        dispatch(handleError("No websocket url defined for this environment"));
        return;
    }

    console.log("Try to connect to", spaceID)

    if (!SOCKET_PORT)
        socket = new WebSocket("wss://" + SOCKET_URL + "/room/" + spaceID);
    else
        socket = new WebSocket("ws://" + SOCKET_URL + ":" + SOCKET_PORT + "/room/" + spaceID);


    socket.onopen = () => {
        dispatch(connect())
        dispatch(handleSuccess("Connected to the signaling server"))
        dispatch(requestLogin())
    };

    socket.onerror = (err) => {
        console.error("Got error", err);
        dispatch(handleError("Connection failed"))
        dispatch(destroySession())
    };

    socket.onclose = () => {
        dispatch(destroySession())
    }

    socket.onmessage = function (msg) {
        // console.log("Got message", msg);
        const data = JSON.parse(msg.data);
        // if (data.type !== "position_change")
        // console.log("Object", data);
        const loggedIn = getState().webSocket.joinedRoom
        switch (data.type) {
            case "login":
                dispatch(handleLogin(data.success, spaceID, data.users));
                break;
            case "new_user":
                if (loggedIn) {
                    dispatch(handleSpaceUser(data));
                }
                break;
            case "leave":
                if (loggedIn)
                    dispatch(disconnectUser(data.id))
                break;
            case "position":
                if (loggedIn && data.id !== getUserID(getState()))
                    dispatch(handlePositionUpdate(data));
                break;
            case "media":
                if (loggedIn)
                    dispatch(setMedia({id: data.id, type: data.medium, state: data.event}));
                break;
            case "message":
                if(!loggedIn) break;
                dispatch(handleMessage(data.content, data.sender_id))
                break;
            case "signal":
                if (!loggedIn)
                    break;
                const fromId: string = data.sender_id;
                if (fromId !== getUserID(getState())) {
                    // TODO check this random wait
                    const randomWait = Math.floor(Math.random() * Math.floor(200))
                    const signal_content = data.content
                    switch (signal_content.signal_type) {
                        case "candidate":
                            setTimeout(() => dispatch(handleCandidate(signal_content.candidate, fromId)), randomWait)
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

export const sendMessage = (message: string): AppThunk => (dispatch, getState) => {
    getOnlineUsers(getState()).forEach(u => {
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
    getToken(getState()).then(token =>
        dispatch(send({
            type: "login",
            token: token,
            user_id: getState().userState.activeUser.id
        }))
    ).catch(() => dispatch(destroySession()))
}

export const sendLogout = (): AppThunk => (dispatch) => {
    dispatch(send({type: "leave"}))
    dispatch(destroySession())
}

export const sendPosition = (position: UserCoordinates): AppThunk => (dispatch) => {
    dispatch(send({
        type: "position",
        position,
    }));
}


export const handleLogin = (success: boolean, spaceid: string, users: UserPayload[]): AppThunk => (dispatch, getState) => {
    if (!success) {
        dispatch(handleError("Join failed. Try again later."))
    } else {
        dispatch(handleSpaceUsers(spaceid, users))
    }
}

export const userSetupReady = (): AppThunk => (dispatch, getState) => {
    const user = getUser(getState())
    dispatch(gotRemoteStream(getUserID(getState())));
    dispatch(handleRTCEvents(getUserID(getState())));
    dispatch(handlePositionUpdate({id: user.id, position: user.position!}))
    dispatch(joined())
}

export const handleLeave = (): AppThunk => (dispatch, getState) => {
    socket?.close()
    dispatch(disconnect())
    dispatch(leftRoom())
}

export default webSocketSlice.reducer;
